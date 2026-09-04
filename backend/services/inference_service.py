import os
import logging
import tempfile
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from core.config import settings
from db.models import Prediction
from services.audio_processor import read_audio, extract_features, fit_input_shape_to_model

logger = logging.getLogger(__name__)


class InferenceService:
    """Manages model loading, feature extraction, inference, and result database logging."""

    def __init__(self):
        self.models: Dict[str, Any] = {}
        self._initialized = False

    def load_models(self):
        """Loads all pretrained model weights from ml_weights directory."""
        if self._initialized:
            return

        logger.info("⏳ Loading machine learning models from ml_weights...")

        # 1. ResNet34 models (PA / LA)
        try:
            from classification_models.keras import Classifiers
            ResNet34, _ = Classifiers.get("resnet34")

            # PA Model (57, 600, 1)
            pa_path = str(settings.MODEL_PA_PATH)
            if os.path.exists(pa_path):
                try:
                    m_pa = ResNet34(input_shape=(57, 600, 1), classes=2)
                    m_pa.load_weights(pa_path)
                    self.models["PA"] = m_pa
                    logger.info(f"✅ PA Model loaded: {pa_path}")
                except Exception as e:
                    logger.error(f"❌ Failed loading PA weights: {e}")
            else:
                logger.warning(f"⚠️ PA model file not found: {pa_path}")

            # LA Model (57, 746, 1)
            la_path = str(settings.MODEL_LA_PATH)
            if os.path.exists(la_path):
                try:
                    m_la = ResNet34(input_shape=(57, 746, 1), classes=2)
                    m_la.load_weights(la_path)
                    self.models["LA"] = m_la
                    logger.info(f"✅ LA Model loaded: {la_path}")
                except Exception as e:
                    logger.error(f"❌ Failed loading LA weights: {e}")
            else:
                logger.warning(f"⚠️ LA model file not found: {la_path}")

        except Exception as e:
            logger.warning(f"⚠️ classification_models (ResNet34) loading error: {e}")

        # 2. Full-graph .h5 models (Keras load_model)
        from tensorflow.keras.models import load_model

        full_models_to_load = [
            ("LFCC_MMS", settings.MODEL_LFCC_MMS_PATH),
            ("MFCC_MMS", settings.MODEL_MFCC_MMS_PATH),
            ("LFCC_VAJA", settings.MODEL_LFCC_VAJA_PATH),
            ("LFCC", settings.MODEL_LFCC_PATH),
            ("MFCC_VAJA", settings.MODEL_MFCC_VAJA_PATH),
        ]

        for key, path_obj in full_models_to_load:
            path_str = str(path_obj)
            if os.path.exists(path_str):
                try:
                    m = load_model(path_str, compile=False)
                    self.models[key] = m
                    logger.info(f"✅ Loaded full model {key}: {path_str}")
                except Exception as e:
                    logger.error(f"❌ Failed loading model {key}: {e}")
            else:
                logger.warning(f"⚠️ Model file not found for {key}: {path_str}")

        self._initialized = True

    def get_model_specs(self, model_key: str) -> Tuple[str, str, int]:
        """Returns (feature_mode, label_prefix, prefer_feature_bins)."""
        specs = {
            "PA": ("lfcc_v1", "PA", 57),
            "LA": ("lfcc_v1", "LA", 57),
            "LFCC_MMS": ("lfcc_v2", "LFCC_MMS", 57),
            "MFCC_MMS": ("mfcc", "MFCC_MMS", 60),
            "LFCC_VAJA": ("lfcc_v2", "LFCC_VAJA", 57),
            "LFCC": ("lfcc_v2", "LFCC", 57),
            "MFCC_VAJA": ("mfcc", "MFCC_VAJA", 60),
        }
        if model_key not in specs:
            raise ValueError(f"Unknown model key: {model_key}")
        return specs[model_key]

    def predict_single_file(
        self,
        file: UploadFile,
        model_key: str,
        db: Session,
        class_order: Tuple[str, str] = ("Fake", "Real"),
    ) -> Dict[str, Any]:
        """Predict a single uploaded audio file and record result in database."""
        if not self._initialized:
            self.load_models()

        model = self.models.get(model_key)
        if model is None:
            logger.error(f"Model '{model_key}' is not loaded")
            return {"filename": file.filename, "error": f"{model_key} model not loaded"}

        mode, label_prefix, prefer_bins = self.get_model_specs(model_key)

        # Temporary save upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        try:
            # Step 1: Read audio
            signal, sr = read_audio(tmp_path)
            if signal is None or sr is None:
                return {"filename": file.filename, "error": "Failed to read audio file"}

            # Step 2: Feature extraction
            feats = extract_features(signal, sr, mode=mode)
            if feats is None:
                return {"filename": file.filename, "error": "Feature extraction failed"}

            # Step 3: Fit input shape
            x = fit_input_shape_to_model(feats, model, prefer_feature_bins=prefer_bins)

            # Step 4: Prediction
            probs = model.predict(x, verbose=0)[0]
            idx = int(np.argmax(probs))

            label = class_order[idx]
            conf_prob = float(probs[idx])
            conf_pct = conf_prob * 100.0

            # Step 5: Save to database
            try:
                pred_record = Prediction(
                    filename=file.filename,
                    label=label,
                    confidence=conf_prob,
                    timestamp=datetime.utcnow(),
                )
                db.add(pred_record)
                db.commit()
            except Exception as db_err:
                db.rollback()
                logger.warning(f"Failed to log prediction to database: {db_err}")

            # Step 6: Return structured response
            return {
                "filename": file.filename,
                "model": label_prefix,
                "label": label,
                "confidence": conf_prob,
                "confidence_pct": conf_pct,
            }

        except Exception as e:
            logger.exception(f"Prediction failed for {file.filename} with {model_key}: {e}")
            return {"filename": file.filename, "error": "Prediction processing error"}

        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

    def predict_batch(
        self,
        files: List[UploadFile],
        model_key: str,
        db: Session
    ) -> List[Dict[str, Any]]:
        """Predict a list of audio files."""
        return [self.predict_single_file(f, model_key, db) for f in files]

    def get_models_status(self) -> Dict[str, Dict[str, Any]]:
        """Returns the operational status and input shape of all managed models."""
        keys = ["PA", "LA", "LFCC_MMS", "MFCC_MMS", "LFCC_VAJA", "MFCC_VAJA", "LFCC"]
        status = {}
        for key in keys:
            m = self.models.get(key)
            if m is None:
                status[key] = {"name": key, "loaded": False}
            else:
                shape = getattr(m, "input_shape", None)
                status[key] = {"name": key, "loaded": True, "input_shape": shape}
        return status


inference_service = InferenceService()
