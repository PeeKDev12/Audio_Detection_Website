# -*- coding: utf-8 -*-
import os, io, tempfile, subprocess, logging, numpy as np
import soundfile as sf
from typing import List, Tuple, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from scipy.fftpack import dct
from sqlalchemy.orm import Session
from datetime import datetime
from passlib.context import CryptContext
from LFCC_pipeline import lfcc as lfcc_ref  # ใช้ LFCC pipeline เดียวกับสคริปต์

# ==== Optional librosa ====
try:
    import librosa
    _HAS_LIBROSA = True
except Exception:
    _HAS_LIBROSA = False

# ==== DB ====
from database.database import get_db, SessionLocal, engine, Base
import database.models as models  # noqa: F401
from database.models import Prediction, User  # noqa: F401

# Initialize and create all tables in database
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)

# ================== Paths ==================
# FFmpeg: allow env override or fallback to PATH
FFMPEG_PATH = os.environ.get("FFMPEG_PATH", r"D:\NECTEC\automatic speaker verification\venv310\Scripts\ffmpeg.exe")
if not os.path.exists(FFMPEG_PATH):
    from shutil import which
    ff_in_path = which("ffmpeg")
    if ff_in_path:
        FFMPEG_PATH = ff_in_path
logging.info(f"FFMPEG_PATH = {FFMPEG_PATH}")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PA_PATH      = os.path.join(BASE_DIR, "models", "PA.h5")
MODEL_LA_PATH      = os.path.join(BASE_DIR, "models", "LA.h5")
MODEL_LFCC_MMS     = os.path.join(BASE_DIR, "models", "LFCC_genuine_MMS.h5")
MODEL_MFCC_MMS     = os.path.join(BASE_DIR, "models", "MFCC_genuine_MMS.h5")
MODEL_LFCC_VAJA    = os.path.join(BASE_DIR, "models", "LFCC_genuine_VAJA.h5")
MODEL_LFCC         = os.path.join(BASE_DIR, "models", "LFCC_Split_3000.h5")
MODEL_MFCC_VAJA    = os.path.join(BASE_DIR, "models", "MFCC_genuine_VAJA.h5")

# ================== FastAPI & CORS ==================
allowed_origins = ["http://localhost:4200"]
extra = os.environ.get("ASV_ALLOWED_ORIGINS", "")
if extra.strip():
    allowed_origins += [o.strip() for o in extra.split(",") if o.strip()]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    logging.info("✅ Database tables initialized successfully.")


# ================== Models ==================
model_pa = model_la = None
model_lfcc_mms = model_mfcc_mms = None
model_lfcc_vaja = model_mfcc_vaja = None
model_lfcc = None

# ----- (A) ResNet34 สำหรับ PA/LA (weights-only) -----
try:
    from classification_models.keras import Classifiers
    ResNet34, _ = Classifiers.get('resnet34')

    if os.path.exists(MODEL_PA_PATH):
        model_pa = ResNet34(input_shape=(57, 600, 1), classes=2)
        model_pa.load_weights(MODEL_PA_PATH)
        logging.info(f"✅ PA Model loaded: {MODEL_PA_PATH}")
    else:
        logging.error(f"❌ PA model file not found: {MODEL_PA_PATH}")

    if os.path.exists(MODEL_LA_PATH):
        model_la = ResNet34(input_shape=(57, 746, 1), classes=2)
        model_la.load_weights(MODEL_LA_PATH)
        logging.info(f"✅ LA Model loaded: {MODEL_LA_PATH}")
    else:
        logging.error(f"❌ LA model file not found: {MODEL_LA_PATH}")
except Exception:
    logging.exception("❌ Model loading error (PA/LA)")

# ----- (B) Full-graph .h5 loaders (MMS/VAJA/LFCC generic) -----
def _safe_load_full_model(path: str):
    if not os.path.exists(path):
        logging.error(f"❌ Model file not found: {path}")
        return None
    try:
        m = load_model(path, compile=False)
        logging.info(f"✅ Loaded full model: {path} | input_shape={m.input_shape}")
        return m
    except Exception:
        logging.exception(f"❌ Failed to load full model: {path}")
        return None

model_lfcc_mms  = _safe_load_full_model(MODEL_LFCC_MMS)    # LFCC_V2
model_mfcc_mms  = _safe_load_full_model(MODEL_MFCC_MMS)    # MFCC
model_lfcc_vaja = _safe_load_full_model(MODEL_LFCC_VAJA)   # LFCC_V2
model_lfcc      = _safe_load_full_model(MODEL_LFCC)        # LFCC_V2 (generic)
model_mfcc_vaja = _safe_load_full_model(MODEL_MFCC_VAJA)   # MFCC

# ================== Audio I/O ==================
def read_audio(path: str) -> Tuple[Optional[np.ndarray], Optional[int]]:
    try:
        cmd = [
            FFMPEG_PATH, "-hide_banner", "-loglevel", "error",
            "-i", path, "-f", "wav", "-acodec", "pcm_f32le", "-ac", "1", "pipe:"
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if proc.returncode != 0:
            raise RuntimeError(proc.stderr.decode("utf-8", "ignore"))
        buf = io.BytesIO(proc.stdout)
        data, sr = sf.read(buf)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr
    except Exception as e:
        logging.error(f"FFmpeg decode failed: {e}")
        return None, None

# ================== Framing & Utils ==================
def enframe(sig: np.ndarray, win_len: int, hop: int) -> np.ndarray:
    sig = np.ascontiguousarray(sig, dtype=np.float32)
    if len(sig) < win_len:
        sig = np.pad(sig, (0, win_len - len(sig)))
    num = 1 + (len(sig) - win_len) // hop
    num = max(1, num)
    shape = (num, win_len)
    strides = (hop * sig.strides[0], sig.strides[0])
    return np.lib.stride_tricks.as_strided(sig, shape=shape, strides=strides)

def _pre_emphasis(x: np.ndarray, alpha: float = 0.97) -> np.ndarray:
    if x.size == 0:
        return x.astype(np.float32)
    y = np.empty_like(x, dtype=np.float32)
    y[0] = x[0]
    y[1:] = x[1:] - alpha * x[:-1]
    return y

def head_tail_20_concat(signal: np.ndarray) -> np.ndarray:
    n = len(signal)
    if n == 0: return signal.astype(np.float32)
    H, T, ext = 0.20, 0.20, 0.05
    head = signal[:int(n * H)]
    tail = signal[int(n * (1 - T)):]
    extra = int(len(head) * ext) if len(head) else 0
    seg1 = signal[max(0, 0 - extra): len(head) + extra]
    pivot = int(n * (1 - T))
    seg2 = signal[max(0, pivot - extra): min(n, pivot + len(tail) + extra)]
    return np.concatenate((seg1, seg2))

def deltas(x: np.ndarray, width: int = 3) -> np.ndarray:
    from scipy.signal import lfilter
    hlen = width // 2
    if x.shape[1] == 0:
        return np.zeros_like(x)
    win = np.arange(hlen, -hlen - 1, -1, dtype=np.float32)
    left = np.repeat(x[:, [0]], hlen, axis=1)
    right = np.repeat(x[:, [-1]], hlen, axis=1)
    xx = np.concatenate([left, x, right], axis=1)
    d = lfilter(win, 1, xx)
    return d[:, hlen * 2 :]

# ================== Feature Backends ==================
def lfcc_v1(sig: np.ndarray, sr: int,
            win_ms=30, nfft=1024, nf=70, nc=19, lo=0, hi=8000) -> np.ndarray:
    sig = np.ascontiguousarray(sig)
    if sig.size == 0: return np.zeros((1, nc), dtype=np.float32)
    x = np.append(sig[0], sig[1:] - 0.97 * sig[:-1])
    win_len = int(win_ms * sr / 1000)
    hop = max(1, win_len // 2)
    frames = enframe(x, win_len, hop) * np.hamming(win_len)
    mag = np.abs(np.fft.rfft(frames, nfft))
    pw = (mag ** 2) / nfft
    nyq = sr / 2.0
    hi_eff = min(hi, nyq)
    freqs = np.linspace(lo, hi_eff, nf + 2)
    bins = np.floor((nfft + 1) * freqs / sr).astype(int)
    maxbin = nfft // 2
    bins = np.clip(bins, 0, maxbin)
    fb = np.zeros((nf, maxbin + 1), dtype=np.float32)
    for j in range(nf):
        a, b, c = bins[j], bins[j+1], bins[j+2]
        if b > a: fb[j, a:b] = np.linspace(0.0, 1.0, b - a, endpoint=False)
        if c > b: fb[j, b:c] = np.linspace(1.0, 0.0, c - b, endpoint=False)
    feat = np.log(np.maximum(pw @ fb.T, np.finfo(float).eps))
    ceps = dct(feat, norm='ortho')[:, :nc]
    return ceps  # (T, nc)

def lfcc_v2(sig: np.ndarray, sr: int, win_ms=30, nfft=1024, nf=70, nc=19, lo=0, hi=8000) -> np.ndarray:
    # ใช้ pipeline อ้างอิง; เคารพ nc ถ้ามี
    c = lfcc_ref(sig=sig, fs=sr, num_ceps=int(nc), low_freq=0, high_freq=4000)  # (T, nc)
    return c

def _mfcc_librosa(y: np.ndarray, sr: int, num_ceps: int, low_freq: int, high_freq: int,
                  n_mels: int = 70, win_ms: float = 30.0, hop_ms: float = 15.0) -> np.ndarray:
    n_fft = max(int(round(win_ms * 0.001 * sr)), 256)
    hop_length = int(round(hop_ms * 0.001 * sr))
    fmin = max(0, low_freq) if low_freq else 0
    fmax = min(high_freq, sr // 2) if (high_freq and high_freq > 0) else None
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=num_ceps,
                                n_fft=n_fft, hop_length=hop_length,
                                n_mels=n_mels, fmin=fmin, fmax=fmax,
                                center=False, htk=True)  # (num_ceps, T)
    return mfcc.astype(np.float32, copy=False)

def _mfcc_minimal(y: np.ndarray, sr: int, num_ceps: int, low_freq: int, high_freq: int,
                  n_mels: int = 70, win_ms: float = 30.0, hop_ms: float = 15.0) -> np.ndarray:
    n_fft = max(int(round(win_ms * 0.001 * sr)), 256)
    hop = int(round(hop_ms * 0.001 * sr))
    win = np.hamming(n_fft).astype(np.float32)

    def _frame_signal(sig, frame_len, hop_len):
        if len(sig) < frame_len:
            sig = np.pad(sig, (0, frame_len - len(sig)), mode="constant")
        num_frames = 1 + (len(sig) - frame_len) // hop_len
        idx = np.tile(np.arange(frame_len), (num_frames, 1)) + np.tile(
            np.arange(0, num_frames * hop_len, hop_len), (frame_len, 1)
        ).T
        frames = sig[idx.astype(np.int32, copy=False)]
        return frames.T  # (frame_len, T)

    frames = _frame_signal(y, n_fft, hop)          # (n_fft, T)
    spec = np.fft.rfft(frames * win[:, None], n=n_fft, axis=0)
    mag = np.abs(spec).astype(np.float32)          # (n_fft//2+1, T)
    pow_spec = (mag ** 2) / float(n_fft)

    def _hz_to_mel(f):  return 2595.0 * np.log10(1.0 + f / 700.0)
    def _mel_to_hz(m):  return 700.0 * (10.0 ** (m / 2595.0) - 1.0)

    fmin = max(0, low_freq) if low_freq else 0
    fmax = min(high_freq, sr // 2) if (high_freq and high_freq > 0) else (sr // 2)

    m_min = _hz_to_mel(fmin); m_max = _hz_to_mel(fmax)
    m_pts = np.linspace(m_min, m_max, n_mels + 2, dtype=np.float32)
    f_pts = _mel_to_hz(m_pts)
    bins = np.clip(np.floor((n_fft + 1) * f_pts / sr).astype(int), 0, n_fft // 2)

    fb = np.zeros((n_mels, n_fft // 2 + 1), dtype=np.float32)
    for m in range(1, n_mels + 1):
        l, c, r = bins[m - 1], bins[m], bins[m + 1]
        if c <= l: c = l + 1
        if r <= c: r = c + 1
        fb[m - 1, l:c] = (np.arange(l, c) - l) / max(1, (c - l))
        fb[m - 1, c:r] = (r - np.arange(c, r)) / max(1, (r - c))

    melE = np.maximum(fb @ pow_spec, 1e-10)       # (n_mels, T)
    log_mel = np.log(melE, dtype=np.float32)

    M, T = log_mel.shape
    n = np.arange(M, dtype=np.float32)
    k = np.arange(num_ceps, dtype=np.float32)[:, None]
    basis = np.cos(np.pi * (n + 0.5) * k / M).astype(np.float32)
    scale = np.sqrt(2.0 / M).astype(np.float32)
    mfcc = (basis @ log_mel) * scale
    mfcc[0, :] *= np.sqrt(0.5).astype(np.float32)
    return mfcc.astype(np.float32)  # (num_ceps, T)

def mfcc_core(sig: np.ndarray, sr: int, n_mfcc: int = 20) -> np.ndarray:
    x = _pre_emphasis(np.asarray(sig, dtype=np.float32), alpha=0.97)
    if _HAS_LIBROSA:
        mfcc = _mfcc_librosa(x, sr, num_ceps=n_mfcc, low_freq=0, high_freq=4000, n_mels=70)
    else:
        mfcc = _mfcc_minimal(x, sr, num_ceps=n_mfcc, low_freq=0, high_freq=4000, n_mels=70)
    return mfcc.T  # (T, n_mfcc)

# ============== Dispatcher ==============
def extract_features(signal: np.ndarray, sr: int, mode: str) -> Optional[np.ndarray]:
    try:
        if mode == 'mfcc':
            sig = head_tail_20_concat(signal)
        else:
            sig = np.asarray(signal, dtype=np.float32)

        if mode == 'lfcc_v1':
            c = lfcc_v1(sig, sr, nc=19)     # (T,19)
            static = c.T
            d1 = deltas(static); d2 = deltas(d1)
            feats = np.vstack([static, d1, d2])         # (57,T)

        elif mode == 'lfcc_v2':
            c = lfcc_v2(sig, sr, nc=19)                 # (T,19)
            static = c.T
            d1 = deltas(static); d2 = deltas(d1)
            feats = np.vstack([static, d1, d2])         # (57,T)

        elif mode == 'mfcc':
            c = mfcc_core(sig, sr, n_mfcc=20)           # (T,20)
            static = c.T
            d1 = deltas(static); d2 = deltas(d1)
            feats = np.vstack([static, d1, d2])         # (60,T)

        else:
            raise ValueError(f"Unknown feature mode: {mode}")

        return feats
    except Exception:
        logging.exception(f"{mode.upper()} extraction failed")
        return None

def fix_input_shape_to_model(feats: np.ndarray, model, prefer_feature_bins: Optional[int] = None) -> np.ndarray:
    if feats is None:
        raise ValueError("features is None")
    if not hasattr(model, "input_shape") or model.input_shape is None:
        raise ValueError("Model has no input_shape; cannot infer target size.")

    _, H, W, C = model.input_shape
    if C != 1:
        raise ValueError(f"Model expects C=1, got C={C}")

    F, T = feats.shape

    def _fit_len(arr_2d: np.ndarray, target: int, axis: int) -> np.ndarray:
        cur = arr_2d.shape[axis]
        if cur > target:
            arr_2d = arr_2d[:target, :] if axis == 0 else arr_2d[:, :target]
        elif cur < target:
            pad = target - cur
            arr_2d = (np.pad(arr_2d, ((0, pad), (0, 0)), mode='constant')
                      if axis == 0 else np.pad(arr_2d, ((0, 0), (0, pad)), mode='constant'))
        return arr_2d

    can_map_F_to_H = (F == H) or (prefer_feature_bins == H)
    can_map_F_to_W = (F == W) or (prefer_feature_bins == W)

    if can_map_F_to_H and not can_map_F_to_W:
        chosen = 'FH'
    elif can_map_F_to_W and not can_map_F_to_H:
        chosen = 'FW'
    elif can_map_F_to_H and can_map_F_to_W:
        chosen = 'FH' if abs(T - W) <= abs(T - H) else 'FW'
    else:
        cost_FH = abs(F - H) + abs(T - W)
        cost_FW = abs(F - W) + abs(T - H)
        chosen = 'FH' if cost_FH <= cost_FW else 'FW'

    if chosen == 'FH':
        x2d = feats.copy()
        x2d = _fit_len(x2d, H, axis=0)
        x2d = _fit_len(x2d, W, axis=1)
    else:
        x2d = feats.T.copy()
        x2d = _fit_len(x2d, H, axis=0)
        x2d = _fit_len(x2d, W, axis=1)

    x = x2d[np.newaxis, ..., np.newaxis]  # (1,H,W,1)
    return x

def _predict_core(
    file: UploadFile,
    model,
    mode: str,
    label_prefix: str,
    prefer_feature_bins: Optional[int] = None,
    class_order: Tuple[str, str] = ("Fake", "Real"),  # index 0 -> Fake, index 1 -> Real
):
    """
    Predict a single uploaded audio file and return prediction result.
    - Reads audio using ffmpeg
    - Extracts LFCC/MFCC features
    - Fits input shape to model
    - Predicts class probabilities
    - Saves result into database
    """

    # === Temporary save upload ===
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name

    try:
        # === Step 1: Read audio ===
        signal, sr = read_audio(tmp_path)
        if signal is None or sr is None:
            return {"filename": file.filename, "error": "Failed to read audio"}

        # === Step 2: Feature extraction ===
        feats = extract_features(signal, sr, mode=mode)  # (F, T)
        if feats is None:
            return {"filename": file.filename, "error": "Feature extraction failed"}

        # === Step 3: Fit input shape ===
        x = fix_input_shape_to_model(feats, model, prefer_feature_bins=prefer_feature_bins)
        logging.info(
            f"{label_prefix}: x.shape={x.shape}, model.input_shape={getattr(model, 'input_shape', None)}"
        )

        # === Step 4: Prediction ===
        probs = model.predict(x, verbose=0)[0]
        idx = int(np.argmax(probs))

        # Map index to label using class_order
        label = class_order[idx]
        conf_prob = float(probs[idx])           # confidence 0..1
        conf_pct = conf_prob * 100.0            # confidence 0..100

        # Debug log for sanity check
        logging.info(
            f"{label_prefix} | probs={np.round(probs, 4).tolist()} "
            f"| idx={idx} -> {label} ({conf_pct:.2f}%)"
        )

        # === Step 5: Save to database ===
        with SessionLocal() as db:
            db.add(Prediction(
                filename=file.filename,
                label=label,              # store clean label ("Real"/"Fake")
                confidence=conf_prob,     # store prob 0..1
                timestamp=datetime.now(),
                # optional: model=label_prefix  (if you have this column)
            ))
            db.commit()

        # === Step 6: Return result ===
        return {
            "filename": file.filename,
            "model": label_prefix,
            "label": label,
            "confidence": conf_prob,       # 0..1
            "confidence_pct": conf_pct,    # 0..100
        }

    except Exception:
        logging.exception(f"{label_prefix} prediction failed")
        return {"filename": file.filename, "error": "Prediction failed"}

    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

# ================== Endpoints ==================
def _log_call(name: str, files: List[UploadFile]):
    logging.info(f"{name} called with {len(files)} file(s)")

# --- PA (LFCC_V1: 57×600) ---
@app.post("/predict_pa")
async def predict_pa(files: List[UploadFile] = File(...)):
    _log_call("/predict_pa", files)
    if model_pa is None:
        raise HTTPException(status_code=500, detail="PA model not loaded")
    return [_predict_core(f, model_pa, mode='lfcc_v1', label_prefix="PA",  prefer_feature_bins=57) for f in files]

# --- LA (LFCC_V1: 57×746) ---
@app.post("/predict_la")
async def predict_la(files: List[UploadFile] = File(...)):
    _log_call("/predict_la", files)
    if model_la is None:
        raise HTTPException(status_code=500, detail="LA model not loaded")
    return [_predict_core(f, model_la, mode='lfcc_v1', label_prefix="LA",  prefer_feature_bins=57) for f in files]

# --- MMS: LFCC_V2 ---
@app.post("/predict_lfcc_mms")
async def predict_lfcc_mms(files: List[UploadFile] = File(...)):
    _log_call("/predict_lfcc_mms", files)
    if model_lfcc_mms is None:
        raise HTTPException(status_code=500, detail="LFCC-MMS model not loaded")
    return [_predict_core(f, model_lfcc_mms, mode='lfcc_v2', label_prefix="LFCC_MMS", prefer_feature_bins=57) for f in files]

# --- MMS: MFCC ---
@app.post("/predict_mfcc_mms")
async def predict_mfcc_mms(files: List[UploadFile] = File(...)):
    _log_call("/predict_mfcc_mms", files)
    if model_mfcc_mms is None:
        raise HTTPException(status_code=500, detail="MFCC-MMS model not loaded")
    return [_predict_core(f, model_mfcc_mms, mode='mfcc', label_prefix="MFCC_MMS", prefer_feature_bins=60) for f in files]

# --- VAJA: LFCC_V2 ---
@app.post("/predict_lfcc_vaja")
async def predict_lfcc_vaja(files: List[UploadFile] = File(...)):
    _log_call("/predict_lfcc_vaja", files)
    if model_lfcc_vaja is None:
        raise HTTPException(status_code=500, detail="LFCC-VAJA model not loaded")
    return [_predict_core(f, model_lfcc_vaja, mode='lfcc_v2', label_prefix="LFCC_VAJA", prefer_feature_bins=57) for f in files]

# --- LFCC generic (alias both names to avoid confusion) ---
@app.post("/predict_lfcc")
@app.post("/predict_lfcc_1")
async def predict_lfcc(files: List[UploadFile] = File(...)):
    _log_call("/predict_lfcc(_1)", files)
    if model_lfcc is None:
        raise HTTPException(status_code=500, detail="LFCC model not loaded")
    return [_predict_core(f, model_lfcc, mode='lfcc_v2', label_prefix="LFCC", prefer_feature_bins=57) for f in files]

# --- VAJA: MFCC ---
@app.post("/predict_mfcc_vaja")
async def predict_mfcc_vaja(files: List[UploadFile] = File(...)):
    _log_call("/predict_mfcc_vaja", files)
    if model_mfcc_vaja is None:
        raise HTTPException(status_code=500, detail="MFCC-VAJA model not loaded")
    return [_predict_core(f, model_mfcc_vaja, mode='mfcc', label_prefix="MFCC_VAJA", prefer_feature_bins=60) for f in files]

# --- History / Delete ---
@app.get("/history")
def get_prediction_history(db: Session = Depends(get_db)):
    results = db.query(Prediction).order_by(Prediction.id.desc()).all()
    return [{
        "id": r.id,
        "filename": r.filename,
        "label": r.label,
        "confidence": f"{r.confidence:.2f}%",
        "timestamp": r.timestamp.isoformat()
    } for r in results]

@app.delete("/history/{prediction_id}")
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(prediction)
    db.commit()
    return {"message": f"Prediction {prediction_id} deleted successfully"}

# --- Health / Models ---
@app.get("/health")
def health():
    return {"ok": True, "time": datetime.now().isoformat()}

@app.get("/models")
def models():
    def info(m, name):
        if m is None:
            return {"name": name, "loaded": False}
        shp = getattr(m, "input_shape", None)
        return {"name": name, "loaded": True, "input_shape": shp}
    return {
        "PA": info(model_pa, "PA"),
        "LA": info(model_la, "LA"),
        "LFCC_MMS": info(model_lfcc_mms, "LFCC_MMS"),
        "MFCC_MMS": info(model_mfcc_mms, "MFCC_MMS"),
        "LFCC_VAJA": info(model_lfcc_vaja, "LFCC_VAJA"),
        "MFCC_VAJA": info(model_mfcc_vaja, "MFCC_VAJA"),
        "LFCC": info(model_lfcc, "LFCC"),
    }

# (optional auth context)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
