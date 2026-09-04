# -*- coding: utf-8 -*-
# batch_protocol_eval.py
import os, io, random, pathlib
import numpy as np
import soundfile as sf
import subprocess
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from scipy.fftpack import dct
from tensorflow.keras.models import load_model
import pandas as pd

# ===== CONFIG =====
FFMPEG_PATH   = r"D:\NECTEC\automatic speaker verification\venv310\Scripts\ffmpeg.exe"
MODEL_LA_PATH = "models/LA.h5"
PROTOCOL_PATH = r"D:\NECTEC\automatic speaker verification\LA\LA\ASVspoof2019_LA_cm_protocols\ASVspoof2019.LA.cm.eval.trl.txt"
AUDIO_DIR     = r"D:\NECTEC\automatic speaker verification\LA\LA\ASVspoof2019_LA_eval\flac"
SAVE_PDF      = "LA_protocol_eval.pdf"

FEAT_DIM  = 57
FRAME_LEN = 746
NFFT      = 1024
WIN_MS    = 30
NF        = 70     # filters
NC        = 19     # cepstra kept
LOW_HZ    = 0
HI_HZ     = 8000

# ===== LOAD MODEL =====
model_la = load_model(MODEL_LA_PATH)
print(f"✅ Loaded LA model from {MODEL_LA_PATH}")

# ===== AUDIO UTILS =====
def read_audio(path):
    """Read mono float32 PCM; fallback to ffmpeg pipe when needed."""
    try:
        data, sr = sf.read(path)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr
    except Exception:
        cmd = [
            FFMPEG_PATH, "-hide_banner", "-loglevel", "error",
            "-i", path, "-f", "wav", "-acodec", "pcm_f32le", "-ac", "1", "pipe:"
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg decode failed: {proc.stderr.decode(errors='ignore')}")
        buf = io.BytesIO(proc.stdout)
        data, sr = sf.read(buf)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr

def enframe(sig, frame_len, hop):
    """Return frames using strided view."""
    n = len(sig)
    if n < frame_len:
        sig = np.pad(sig, (0, frame_len - n), mode="constant")
        n = len(sig)
    num = 1 + (n - frame_len) // hop
    shape = (num, frame_len)
    strides = (hop * sig.strides[0], sig.strides[0])
    return np.lib.stride_tricks.as_strided(sig, shape=shape, strides=strides)

# ===== DELTA (regression N=2) =====
def delta_reg(x, N=2, axis=1):
    """
    Regression delta along time axis.
    x: (F, T) or (T, F) depending on axis; return same shape.
    """
    x = np.asarray(x)
    if axis == 1:
        pad = np.pad(x, ((0,0), (N,N)), mode="edge")
        den = 2 * sum(i*i for i in range(1, N+1))
        out = np.zeros_like(x)
        for n in range(1, N+1):
            out += n * (pad[:, N+n:N+n+x.shape[1]] - pad[:, N-n:N-n+x.shape[1]])
        return out / den
    elif axis == 0:
        pad = np.pad(x, ((N,N), (0,0)), mode="edge")
        den = 2 * sum(i*i for i in range(1, N+1))
        out = np.zeros_like(x)
        for n in range(1, N+1):
            out += n * (pad[N+n:N+n+x.shape[0], :] - pad[N-n:N-n+x.shape[0], :])
        return out / den
    else:
        raise ValueError("axis must be 0 or 1")

# ===== FEATURE EXTRACTION =====
def extract_lfcc_features(signal, sr):
    """
    Head+Tail 20% (+5% context), pre-emphasis, Hamming 30ms, hop 15ms,
    NF=70 filterbank linear, cepstra NC=19, then stack [static, delta, delta^2].
    Return (57, T).
    """
    n = len(signal)
    if n == 0:
        raise ValueError("empty signal")

    # Head & tail 20% + 5% context
    H, Ttail, ext = 0.20, 0.20, 0.05
    head = signal[:int(n * H)]
    tail = signal[int(n * (1 - Ttail)):]
    extra = int(len(head) * ext)
    seg1 = signal[max(0, 0 - extra): len(head) + extra]
    seg2 = signal[int(n * (1 - Ttail)) - extra : int(n * (1 - Ttail)) + len(tail) + extra]
    sig = np.concatenate((seg1, seg2)) if len(seg1) and len(seg2) else signal

    # pre-emphasis
    x = np.append(sig[0], sig[1:] - 0.97 * sig[:-1])

    # framing
    win_len = int(WIN_MS * sr / 1000)
    hop = win_len // 2
    frames = enframe(x, win_len, hop) * np.hamming(win_len)

    # power spectrum
    mag = np.abs(np.fft.rfft(frames, NFFT))
    pw = (mag ** 2) / NFFT  # (num_frames, nfft/2+1)

    # linear filterbank [LOW_HZ, HI_HZ]
    freqs = np.linspace(LOW_HZ, HI_HZ, NF + 2)
    # mapping freq->bin (round down) relative to sr
    # rfft size is NFFT//2 + 1
    bins = np.floor((NFFT + 1) * freqs / sr).astype(int)
    bins = np.clip(bins, 0, NFFT // 2)  # safety
    fb = np.zeros((NF, NFFT // 2 + 1), dtype=np.float32)
    for j in range(NF):
        a, b, c = bins[j], bins[j+1], bins[j+2]
        if b > a:
            fb[j, a:b] = np.linspace(0.0, 1.0, b - a, endpoint=False)
        if c > b:
            fb[j, b:c] = np.linspace(1.0, 0.0, c - b, endpoint=False)

    # filterbank energies -> log -> DCT -> first 19
    e = np.dot(pw, fb.T)  # (num_frames, NF)
    e = np.maximum(e, np.finfo(float).eps)
    loge = np.log(e)
    ceps = dct(loge, norm='ortho', axis=1)[:, :NC]  # (num_frames, 19)

    # shape to (19, T)
    stat_19 = ceps.T  # (19, T)

    # deltas via regression along time axis
    d1 = delta_reg(stat_19, N=2, axis=1)
    d2 = delta_reg(d1,      N=2, axis=1)

    # stack -> (57, T)
    feats_57 = np.concatenate([stat_19, d1, d2], axis=0)
    return feats_57

def tile_or_cut_to_length(feats, target_len):
    """
    Repeat along time axis then cut (no zero-pad).
    feats: (57, T)
    return: (57, target_len)
    """
    if feats.shape[0] != FEAT_DIM:
        raise ValueError(f"Expected {FEAT_DIM} features, got {feats.shape[0]}")
    T = feats.shape[1]
    if T == 0:
        raise ValueError("empty feature time axis")
    x = feats
    while x.shape[1] < target_len:
        gap = target_len - x.shape[1]
        if gap > x.shape[1]:
            x = np.concatenate([x, x], axis=1)
        else:
            x = np.concatenate([x, x[:, :gap]], axis=1)
    return x[:, :target_len]

def make_model_input(feats_57):
    """
    (57, T) -> (1, 57, 746, 1) by repeat-then-cut.
    """
    x = tile_or_cut_to_length(feats_57, FRAME_LEN)
    return x[np.newaxis, ..., np.newaxis].astype(np.float32)

def predict_file(path):
    signal, sr = read_audio(path)
    feats = extract_lfcc_features(signal, sr)      # (57, T)
    x = make_model_input(feats)                    # (1, 57, 746, 1)
    probs = model_la.predict(x, verbose=0)[0]
    idx = int(np.argmax(probs))
    return "Real" if idx == 0 else "Fake"

# ===== PROTOCOL & RESULTS =====
def parse_protocol(path):
    """
    LA protocol format: columns incl. <speaker> <utt_id> ... <label>
    """
    mapping = {}
    with open(path, "r") as f:
        for line in f:
            parts = line.strip().split()
            if not parts:
                continue
            fid = parts[1]
            tag = parts[-1].lower()
            mapping[fid] = "Real" if tag == "bonafide" else "Fake"
    return mapping

def save_predictions_to_excel(results, output_dir="protocol_eva;_LA_outputs"):
    """
    results rows: (set_tag, fid, ground_truth, prediction)
    """
    os.makedirs(output_dir, exist_ok=True)

    mixed = [r for r in results if r[0] == "MIXED"]
    real  = [r for r in results if r[0] == "LABELED" and r[2] == "Real"]
    fake  = [r for r in results if r[0] == "LABELED" and r[2] == "Fake"]

    def export(rows, filename):
        df = pd.DataFrame(rows, columns=["File", "GroundTruth", "Prediction"])
        path = os.path.join(output_dir, filename)
        df.to_excel(path, index=False)
        print(f"📄 Saved {path}")

    export([(fid, gt, pred) for _, fid, gt, pred in mixed], "Mixed.xlsx")
    export([(fid, gt, pred) for _, fid, gt, pred in real],  "Real.xlsx")
    export([(fid, gt, pred) for _, fid, gt, pred in fake],  "Fake.xlsx")

# ===== MAIN =====
def main():
    proto = parse_protocol(PROTOCOL_PATH)
    files = {p.stem: str(p) for p in pathlib.Path(AUDIO_DIR).glob("*.flac")}

    real_files = [files[fid] for fid, lab in proto.items() if lab == "Real" and fid in files]
    fake_files = [files[fid] for fid, lab in proto.items() if lab == "Fake" and fid in files]
    all_files  = [files[fid] for fid in proto if fid in files]

    n_real  = min(100, len(real_files))
    n_fake  = min(100, len(fake_files))
    n_mixed = min(100, len(all_files))

    real_pick  = random.sample(real_files, n_real) if n_real else []
    fake_pick  = random.sample(fake_files, n_fake) if n_fake else []
    mixed_pick = random.sample(all_files,  n_mixed) if n_mixed else []

    print("\n🎧 ตัวอย่าง Real:", [pathlib.Path(f).stem for f in real_pick[:5]], "...")
    print("🎧 ตัวอย่าง Fake:", [pathlib.Path(f).stem for f in fake_pick[:5]], "...")
    print("🎧 ตัวอย่าง Mixed:", [pathlib.Path(f).stem for f in mixed_pick[:5]], "...")

    results = []

    def predict_and_append(label, path, gt=None):
        fid = pathlib.Path(path).stem
        try:
            pred = predict_file(path)
            results.append((label, fid, gt if gt else pred, pred))
        except Exception as e:
            print(f"⚠️ Error predicting {fid}: {e}")

    # Mixed = สุ่มรวม (ใช้ GT จากโปรโตคอล)
    for path in mixed_pick:
        fid = pathlib.Path(path).stem
        gt = proto.get(fid, "Unknown")
        predict_and_append("MIXED", path, gt)

    # ชุด labeled ที่รู้ GT แน่ ๆ
    for path in real_pick:
        predict_and_append("LABELED", path, "Real")
    for path in fake_pick:
        predict_and_append("LABELED", path, "Fake")

    # สร้าง confusion + metrics
    def confusion(recs):
        TP = TN = FP = FN = 0  # Positive = Real (ตามนิยามนี้)
        for gt, pred in recs:
            if gt == "Real" and pred == "Real": TP += 1
            elif gt == "Fake" and pred == "Fake": TN += 1
            elif gt == "Fake" and pred == "Real": FP += 1
            elif gt == "Real" and pred == "Fake": FN += 1
        total = TP + TN + FP + FN
        acc  = (TP + TN) / total if total else 0.0
        prec = TP / (TP + FP + 1e-9)
        rec  = TP / (TP + FN + 1e-9)
        f1   = 2 * prec * rec / (prec + rec + 1e-9)
        return {"TP": TP, "TN": TN, "FP": FP, "FN": FN,
                "Acc": acc, "Prec": prec, "Rec": rec, "F1": f1}

    mixed_recs   = [(gt, pred) for s, fid, gt, pred in results if s == "MIXED"   and gt in ("Real", "Fake")]
    labeled_recs = [(gt, pred) for s, fid, gt, pred in results if s == "LABELED" and gt in ("Real", "Fake")]

    cm_mixed   = confusion(mixed_recs)
    cm_labeled = confusion(labeled_recs)

    # เซฟ Excel
    save_predictions_to_excel(results)

    # วาด PDF: confusion + metrics
    with PdfPages(SAVE_PDF) as pdf:
        for name, cm in [("Mixed", cm_mixed), ("Labeled", cm_labeled)]:
            # Confusion heatmap (ตามนิยามที่กำหนด)
            plt.figure(figsize=(5,4))
            plt.title(f"{name} Confusion Matrix")
            # แผงซ้ายคือ GT Real: [TP, FN], แผงขวาคือ GT Fake: [FP, TN]
            mat = np.array([[cm["TP"], cm["FN"]],
                            [cm["FP"], cm["TN"]]], dtype=int)
            plt.imshow(mat, cmap="Blues")
            for i in range(2):
                for j in range(2):
                    plt.text(j, i, str(mat[i, j]), ha="center", va="center")
            plt.xticks([0, 1], ["Pred Real", "Pred Fake"])
            plt.yticks([0, 1], ["GT Real", "GT Fake"])
            plt.tight_layout()
            pdf.savefig()
            plt.close()

            # Metrics bar
            plt.figure(figsize=(5,4))
            plt.bar(["Acc", "Prec", "Rec", "F1"], [cm["Acc"], cm["Prec"], cm["Rec"], cm["F1"]])
            plt.ylim(0, 1)
            plt.title(f"{name} Metrics")
            plt.tight_layout()
            pdf.savefig()
            plt.close()

    print(f"✅ Saved PDF: {SAVE_PDF}")

if __name__ == "__main__":
    main()
