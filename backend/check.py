import os
import numpy as np
import matplotlib.pyplot as plt
import soundfile as sf
import io
import subprocess
from pathlib import Path

# ===== CONFIG =====
FFMPEG_PATH = r"D:\NECTEC\automatic speaker verification\venv310\Scripts\ffmpeg.exe"
WAV_DIR = r"D:\NECTEC\automatic speaker verification\Feature Extract\LA\eval\bonafide"
FLAC_DIR = r"D:\NECTEC\automatic speaker verification\LA\LA\ASVspoof2019_LA_eval\flac"
MAX_COMPARE = 5  # เปรียบเทียบสูงสุดกี่ไฟล์ (กันลูปใหญ่เกินไป)

# ===== READ AUDIO =====
def read_audio(path):
    try:
        data, sr = sf.read(path)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr
    except:
        cmd = [FFMPEG_PATH, "-hide_banner", "-loglevel", "error",
               "-i", path, "-f", "wav", "-acodec", "pcm_f32le", "-ac", "1", "pipe:"]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        buf = io.BytesIO(proc.stdout)
        data, sr = sf.read(buf)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr

# ===== LOOP OVER .WAV FILES =====
wav_files = list(Path(WAV_DIR).glob("*.wav"))
count = 0

for wav_path in wav_files:
    file_id = wav_path.stem  # เช่น LA_E_3379393
    flac_path = Path(FLAC_DIR) / (file_id + ".flac")

    if not flac_path.exists():
        print(f"❌ Missing FLAC: {flac_path}")
        continue

    # === อ่านเสียง ===
    sig_wav, sr_wav = read_audio(wav_path)
    sig_flac, sr_flac = read_audio(flac_path)

    print(f"\n📁 {file_id} | WAV: {sig_wav.shape}, FLAC: {sig_flac.shape}")

    # === เช็ค sample rate ===
    if sr_wav != sr_flac:
        print(f"⚠️ Sample rate mismatch: wav={sr_wav}, flac={sr_flac}")
        continue

    # === เปรียบเทียบ waveform ===
    min_len = min(len(sig_wav), len(sig_flac))
    match = np.allclose(sig_wav[:min_len], sig_flac[:min_len], rtol=1e-3, atol=1e-5)
    print(f"✅ Waveform match: {match}")

    # === Plot ===
    plt.figure(figsize=(12, 5))
    plt.plot(sig_flac[:min_len], label="FLAC", alpha=0.7)
    plt.plot(sig_wav[:min_len], label="WAV", alpha=0.7, linestyle='--')
    plt.title(f"Waveform Comparison: {file_id}")
    plt.xlabel("Sample Index")
    plt.ylabel("Amplitude")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

    plt.figure(figsize=(12, 3))
    plt.plot(sig_flac[:min_len] - sig_wav[:min_len], color='red')
    plt.title(f"Difference (FLAC - WAV): {file_id}")
    plt.xlabel("Sample Index")
    plt.ylabel("Amplitude Diff")
    plt.grid(True)
    plt.tight_layout()
    plt.show()

    count += 1
    if count >= MAX_COMPARE:
        break
