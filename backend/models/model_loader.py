from tensorflow.keras.models import load_model

def load_prediction_model(model_path='models/LFCC_ResNet34_best.h5'):
    """
    Load a pre-trained Keras model for audio spoofing detection.
    """
    try:
        model = load_model(model_path)
        print("✅ Model loaded successfully.")
        return model
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return None
