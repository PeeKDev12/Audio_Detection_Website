# batch_protocol_eval.py
import os, io, random, pathlib
import numpy as np
import soundfile as sf
import subprocess
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from scipy.fftpack import dct
from classification_models.tfkeras import Classifiers
from tensorflow.keras.models import load_model
import pandas as pd

# ===== CONFIG =====
FFMPEG_PATH   = r"D:\NECTEC\automatic speaker verification\venv310\Scripts\ffmpeg.exe"
MODEL_PA_PATH = "models/PA.h5"
PROTOCOL_PATH = r"D:\NECTEC\automatic speaker verification\PA\PA\ASVspoof2019_PA_cm_protocols\ASVspoof2019.PA.cm.eval.trl.txt"
AUDIO_DIR     = r"D:\NECTEC\automatic speaker verification\PA\PA\ASVspoof2019_PA_eval\flac"
SAVE_PDF      = "PA_protocol_eval.pdf"

# ===== LOAD MODEL =====
ResNet34, _ = Classifiers.get('resnet34')
model_pa = ResNet34(input_shape=(57, 600, 1), classes=2)
model_pa.load_weights(MODEL_PA_PATH)
print(f"✅ Loaded PA model from {MODEL_PA_PATH}")

# ===== AUDIO UTILS =====
def read_audio(path):
    try:
        data, sr = sf.read(path)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr
    except:
        cmd = [FFMPEG_PATH, "-i", path, "-f", "wav", "-acodec", "pcm_f32le", "-ac", "1", "pipe:"]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        buf = io.BytesIO(proc.stdout)
        data, sr = sf.read(buf)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr

def enframe(sig, frame_len, hop):
    if len(sig) < frame_len:
        sig = np.pad(sig, (0, frame_len - len(sig)))
    num = 1 + (len(sig) - frame_len) // hop
    shape = (num, frame_len)
    strides = (hop * sig.strides[0], sig.strides[0])
    return np.lib.stride_tricks.as_strided(sig, shape=shape, strides=strides)

# ===== FEATURE EXTRACTION =====
def extract_lfcc_features(signal, sr):
    try:
        n = len(signal)
        H, T, ext = 0.20, 0.20, 0.05
        head = signal[:int(n * H)]
        tail = signal[int(n * (1 - T)):]
        extra = int(len(head) * ext)
        seg1 = signal[max(0, 0 - extra): len(head) + extra]
        seg2 = signal[int(n * (1 - T)) - extra : int(n * (1 - T)) + len(tail) + extra]
        sig = np.concatenate((seg1, seg2))

        emphasized = np.append(sig[0], sig[1:] - 0.97 * sig[:-1])
        win_len = int(0.03 * sr)
        hop = win_len // 2
        frames = enframe(emphasized, win_len, hop) * np.hamming(win_len)
        mag = np.abs(np.fft.rfft(frames, 1024))
        pw = mag ** 2 / 1024

        freqs = np.linspace(0, 8000, 70 + 2)
        bins = np.floor((1025) * freqs / sr).astype(int)
        fb = np.zeros((70, 1024 // 2 + 1))
        for j in range(70):
            fb[j, bins[j]: bins[j+1]] = np.linspace(0, 1, bins[j+1] - bins[j])
            fb[j, bins[j+1]: bins[j+2]] = np.linspace(1, 0, bins[j+2] - bins[j+1])

        feat = np.log(np.maximum(pw.dot(fb.T), np.finfo(float).eps))
        ceps = dct(feat, norm='ortho')[:, :19]  # (T, 19)

        features_19 = ceps.T  # (19, T)
        delta  = np.gradient(features_19, axis=1)
        deltad = np.gradient(delta, axis=1)
        features_57 = np.concatenate([features_19, delta, deltad], axis=0)  # (57, T)

        return features_57
    except Exception as e:
        print(f"❌ LFCC extraction failed: {e}")
        return None

def fix_input_shape(feats, target_shape=(57, 600)):
    if feats.shape[0] != 57:
        raise ValueError(f"Expected 57 features, got {feats.shape[0]}")
    if feats.shape[1] > target_shape[1]:
        feats = feats[:, :target_shape[1]]
    elif feats.shape[1] < target_shape[1]:
        pad_width = target_shape[1] - feats.shape[1]
        feats = np.pad(feats, ((0, 0), (0, pad_width)), mode='constant')
    return feats[np.newaxis, ..., np.newaxis]  # (1, 57, 600, 1)

def predict_file(path):
    signal, sr = read_audio(path)
    feats = extract_lfcc_features(signal, sr)
    x = fix_input_shape(feats, (57, 600))
    probs = model_pa.predict(x, verbose=0)[0]
    idx = int(np.argmax(probs))
    return "Real" if idx == 0 else "Fake"

# ===== PROTOCOL & RESULTS =====
def parse_protocol(path):
    mapping = {}
    with open(path, "r") as f:
        for line in f:
            parts = line.strip().split()
            if not parts: continue
            file_id, tag = parts[1], parts[-1]
            mapping[file_id] = "Real" if tag.lower() == "bonafide" else "Fake"
    return mapping

def save_predictions_to_excel(results, output_dir="protocol_eval_1_outputs"):
    os.makedirs(output_dir, exist_ok=True)

    mixed = [r for r in results if r[0] == "MIXED"]
    real  = [r for r in results if r[0] == "LABELED" and r[2] == "Real"]
    fake  = [r for r in results if r[0] == "LABELED" and r[2] == "Fake"]

    def export(df_data, filename):
        df = pd.DataFrame(df_data, columns=["File", "GroundTruth", "Prediction"])
        path = os.path.join(output_dir, filename)
        df.to_excel(path, index=False)
        print(f"📄 Saved {path}")

    export([(fid, gt, pred) for _, fid, gt, pred in mixed], "Mixed100.xlsx")
    export([(fid, gt, pred) for _, fid, gt, pred in real],  "Real50.xlsx")
    export([(fid, gt, pred) for _, fid, gt, pred in fake],  "Fake60.xlsx")

# ===== MAIN =====
def main():
    proto = parse_protocol(PROTOCOL_PATH)
    files = {p.stem: str(p) for p in pathlib.Path(AUDIO_DIR).glob("*.flac")}

    real_files = [files[fid] for fid, lab in proto.items() if lab == "Real" and fid in files]
    fake_files = [files[fid] for fid, lab in proto.items() if lab == "Fake" and fid in files]

    n_real = min(100, len(real_files))
    n_fake = min(100, len(fake_files))
    n_mixed = min(100, len(real_files + fake_files))

    real_pick = random.sample(real_files, n_real)
    fake_pick = random.sample(fake_files, n_fake)
    mixed_pick = random.sample(real_files + fake_files, n_mixed)

    print("\n🎧 สุ่มเสียง Real:", [pathlib.Path(f).stem for f in real_pick[:5]], "...")
    print("🎧 สุ่มเสียง Fake:", [pathlib.Path(f).stem for f in fake_pick[:5]], "...")
    print("🎧 สุ่มเสียง Mixed:", [pathlib.Path(f).stem for f in mixed_pick[:5]], "...")

    results = []

    def predict_and_append(label, path, gt=None):
        fid = pathlib.Path(path).stem
        try:
            pred = predict_file(path)
            results.append((label, fid, gt if gt else pred, pred))
        except Exception as e:
            print(f"⚠️ Error predicting {fid}: {e}")

    for path in mixed_pick:
        fid = pathlib.Path(path).stem
        gt = proto[fid]
        predict_and_append("MIXED", path, gt)

    for path in real_pick:
        predict_and_append("LABELED", path, "Real")
    for path in fake_pick:
        predict_and_append("LABELED", path, "Fake")

    def confusion(recs):
        TP = TN = FP = FN = 0
        for gt, pred in recs:
            if gt == "Real" and pred == "Real": TP += 1
            elif gt == "Fake" and pred == "Fake": TN += 1
            elif gt == "Fake" and pred == "Real": FP += 1
            elif gt == "Real" and pred == "Fake": FN += 1
        total = TP + TN + FP + FN
        acc = (TP + TN) / total if total else 0
        prec = TP / (TP + FP + 1e-9)
        rec = TP / (TP + FN + 1e-9)
        f1 = 2 * prec * rec / (prec + rec + 1e-9)
        return {"TP": TP, "TN": TN, "FP": FP, "FN": FN,
                "Acc": acc, "Prec": prec, "Rec": rec, "F1": f1}

    mixed_recs = [(gt, pred) for s, fid, gt, pred in results if s == "MIXED"]
    labeled_recs = [(gt, pred) for s, fid, gt, pred in results if s == "LABELED"]

    cm_mixed = confusion(mixed_recs)
    cm_labeled = confusion(labeled_recs)

    save_predictions_to_excel(results)

    with PdfPages(SAVE_PDF) as pdf:
        for name, cm in [("Mixed", cm_mixed), ("Labeled", cm_labeled)]:
            plt.figure()
            plt.title(f"{name} Confusion Matrix")
            mat = np.array([[cm["TP"], cm["FP"]], [cm["FN"], cm["TN"]]])
            plt.imshow(mat, cmap="Blues")
            for i in range(2):
                for j in range(2):
                    plt.text(j, i, str(mat[i, j]), ha="center", va="center")
            plt.xticks([0, 1], ["Pred Real", "Pred Fake"])
            plt.yticks([0, 1], ["GT Real", "GT Fake"])
            pdf.savefig()
            plt.close()

            plt.figure()
            plt.bar(["Acc", "Prec", "Rec", "F1"], [cm["Acc"], cm["Prec"], cm["Rec"], cm["F1"]])
            plt.ylim(0, 1)
            plt.title(f"{name} Metrics")
            pdf.savefig()
            plt.close()

    print(f"✅ Saved PDF: {SAVE_PDF}")

if __name__ == "__main__":
    main()
