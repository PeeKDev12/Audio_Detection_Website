import io
import logging
import subprocess
import numpy as np
import soundfile as sf
import torch
import torchaudio
from typing import Optional, Tuple, Union
from scipy.fftpack import dct
from scipy.signal import lfilter
from core.config import settings

logger = logging.getLogger(__name__)

try:
    import librosa
    _HAS_LIBROSA = True
except Exception:
    _HAS_LIBROSA = False


# ================== Audio File I/O ==================
def read_audio(path: str) -> Tuple[Optional[np.ndarray], Optional[int]]:
    """
    Read audio file using soundfile or FFmpeg decoding pipe to float32 mono array.
    """
    # Try standard soundfile first
    try:
        data, sr = sf.read(path)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        return data.astype(np.float32), sr
    except Exception:
        pass

    # Fallback to FFmpeg pipe
    try:
        ffmpeg_bin = settings.FFMPEG_PATH or "ffmpeg"
        cmd = [
            ffmpeg_bin, "-hide_banner", "-loglevel", "error",
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
        logger.error(f"Failed to read/decode audio with FFmpeg: {e}")
        return None, None


# ================== AASIST Raw Audio Processing ==================
def process_raw_audio_for_aasist(
    audio_source: Union[str, bytes, io.BytesIO],
    target_sr: int = 16000,
    target_length: Optional[int] = None,
) -> torch.Tensor:
    """
    Preprocess raw audio strictly for AASIST and raw waveform deepfake detectors.
    - Decodes audio to mono waveform
    - Strictly resamples to target_sr (16,000 Hz)
    - Returns a 1D PyTorch float32 tensor (num_samples,) without extracting spectrogram/LFCC/MFCC
    """
    if isinstance(audio_source, (bytes, bytearray)):
        buf = io.BytesIO(audio_source)
        data, sr = sf.read(buf)
    elif isinstance(audio_source, io.BytesIO):
        audio_source.seek(0)
        data, sr = sf.read(audio_source)
    elif isinstance(audio_source, str):
        data, sr = read_audio(audio_source)
        if data is None or sr is None:
            raise ValueError(f"Could not read audio from path: {audio_source}")
    else:
        raise TypeError(f"Unsupported audio source type: {type(audio_source)}")

    if data.ndim > 1:
        data = np.mean(data, axis=1)

    waveform = torch.from_numpy(data.astype(np.float32)).float()

    if sr != target_sr:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
        waveform = resampler(waveform.unsqueeze(0)).squeeze(0)

    if target_length is not None and target_length > 0:
        num_samples = waveform.size(0)
        if num_samples < target_length:
            repeats = int(np.ceil(target_length / num_samples))
            waveform = waveform.repeat(repeats)[:target_length]
        elif num_samples > target_length:
            waveform = waveform[:target_length]

    return waveform


# ================== Framing & Signal Processing ==================
def enframe(sig: np.ndarray, win_len: int, hop: int) -> np.ndarray:
    """Frame signal into 2D overlapping window matrix."""
    sig = np.ascontiguousarray(sig, dtype=np.float32)
    if len(sig) < win_len:
        sig = np.pad(sig, (0, win_len - len(sig)))
    num = 1 + (len(sig) - win_len) // hop
    num = max(1, num)
    shape = (num, win_len)
    strides = (hop * sig.strides[0], sig.strides[0])
    return np.lib.stride_tricks.as_strided(sig, shape=shape, strides=strides)


def pre_emphasis(x: np.ndarray, alpha: float = 0.97) -> np.ndarray:
    """Apply pre-emphasis filter."""
    if x.size == 0:
        return x.astype(np.float32)
    y = np.empty_like(x, dtype=np.float32)
    y[0] = x[0]
    y[1:] = x[1:] - alpha * x[:-1]
    return y


def head_tail_20_concat(signal: np.ndarray) -> np.ndarray:
    """Concatenate 20% head and 20% tail segments with 5% margin."""
    n = len(signal)
    if n == 0:
        return signal.astype(np.float32)
    H, T, ext = 0.20, 0.20, 0.05
    head = signal[:int(n * H)]
    tail = signal[int(n * (1 - T)):]
    extra = int(len(head) * ext) if len(head) else 0
    seg1 = signal[max(0, 0 - extra): len(head) + extra]
    pivot = int(n * (1 - T))
    seg2 = signal[max(0, pivot - extra): min(n, pivot + len(tail) + extra)]
    return np.concatenate((seg1, seg2))


def deltas(x: np.ndarray, width: int = 3) -> np.ndarray:
    """Calculate regression delta along time axis."""
    hlen = width // 2
    if x.shape[1] == 0:
        return np.zeros_like(x)
    win = np.arange(hlen, -hlen - 1, -1, dtype=np.float32)
    left = np.repeat(x[:, [0]], hlen, axis=1)
    right = np.repeat(x[:, [-1]], hlen, axis=1)
    xx = np.concatenate([left, x, right], axis=1)
    d = lfilter(win, 1, xx)
    return d[:, hlen * 2:]


# ================== LFCC Extraction ==================
def extract_lfcc_v1(
    sig: np.ndarray,
    sr: int,
    win_ms: float = 30,
    nfft: int = 1024,
    nf: int = 70,
    nc: int = 19,
    lo: float = 0,
    hi: float = 8000,
) -> np.ndarray:
    """LFCC Feature Extraction Version 1 (used by ResNet34 models)."""
    sig = np.ascontiguousarray(sig)
    if sig.size == 0:
        return np.zeros((1, nc), dtype=np.float32)
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
        a, b, c = bins[j], bins[j + 1], bins[j + 2]
        if b > a:
            fb[j, a:b] = np.linspace(0.0, 1.0, b - a, endpoint=False)
        if c > b:
            fb[j, b:c] = np.linspace(1.0, 0.0, c - b, endpoint=False)
    feat = np.log(np.maximum(pw @ fb.T, np.finfo(float).eps))
    ceps = dct(feat, norm="ortho")[:, :nc]
    return ceps  # (T, nc)


def extract_lfcc_v2(
    sig: np.ndarray,
    sr: int,
    win_ms: float = 30,
    hop_ms: float = 15,
    nfft: int = 1024,
    nfilts: int = 70,
    num_ceps: int = 19,
    low_freq: float = 0,
    high_freq: float = 4000,
) -> np.ndarray:
    """LFCC Feature Extraction Version 2 (Linear Filterbanks)."""
    sig = np.asarray(sig, dtype=np.float32)
    if sig.size == 0:
        return np.zeros((1, num_ceps), dtype=np.float32)

    win_len = int(round(win_ms * 0.001 * sr))
    win_hop = int(round(hop_ms * 0.001 * sr))

    frames = enframe(sig, win_len, win_hop)
    windows = frames * np.hamming(win_len)

    fourrier_transform = np.fft.rfft(windows, nfft)
    abs_fft_values = np.abs(fourrier_transform) ** 2

    # Linear filter banks
    high_freq = high_freq or sr / 2
    low_freq = low_freq or 0
    freq_pts = np.linspace(low_freq, high_freq, nfilts + 2)
    bins = np.floor((nfft + 1) * freq_pts / sr).astype(int)
    bins = np.clip(bins, 0, nfft // 2)

    fb = np.zeros((nfilts, nfft // 2 + 1), dtype=np.float32)
    for m in range(1, nfilts + 1):
        l, c, r = bins[m - 1], bins[m], bins[m + 1]
        if c <= l: c = l + 1
        if r <= c: r = c + 1
        fb[m - 1, l:c] = (np.arange(l, c) - l) / max(1, (c - l))
        fb[m - 1, c:r] = (r - np.arange(c, r)) / max(1, (r - c))

    features = np.dot(abs_fft_values, fb.T)
    log_features = np.log10(features + 2.2204e-16)
    lfccs = dct(log_features, type=2, norm="ortho", axis=1)[:, :num_ceps]
    return lfccs.astype(np.float32)  # (T, num_ceps)


# ================== MFCC Extraction ==================
def _mfcc_minimal(
    y: np.ndarray,
    sr: int,
    num_ceps: int = 20,
    low_freq: int = 0,
    high_freq: int = 4000,
    n_mels: int = 70,
    win_ms: float = 30.0,
    hop_ms: float = 15.0,
) -> np.ndarray:
    n_fft = max(int(round(win_ms * 0.001 * sr)), 256)
    hop = int(round(hop_ms * 0.001 * sr))
    win = np.hamming(n_fft).astype(np.float32)

    frames = enframe(y, n_fft, hop)
    spec = np.fft.rfft(frames * win, n=n_fft, axis=1)
    mag = np.abs(spec).astype(np.float32)
    pow_spec = (mag ** 2) / float(n_fft)

    def _hz_to_mel(f): return 2595.0 * np.log10(1.0 + f / 700.0)
    def _mel_to_hz(m): return 700.0 * (10.0 ** (m / 2595.0) - 1.0)

    fmin = max(0, low_freq) if low_freq else 0
    fmax = min(high_freq, sr // 2) if (high_freq and high_freq > 0) else (sr // 2)

    m_min = _hz_to_mel(fmin)
    m_max = _hz_to_mel(fmax)
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

    melE = np.maximum(pow_spec @ fb.T, 1e-10)
    log_mel = np.log(melE, dtype=np.float32)

    M = n_mels
    n = np.arange(M, dtype=np.float32)
    k = np.arange(num_ceps, dtype=np.float32)[:, None]
    basis = np.cos(np.pi * (n + 0.5) * k / M).astype(np.float32)
    scale = np.sqrt(2.0 / M).astype(np.float32)
    mfcc = (log_mel @ basis.T) * scale
    mfcc[:, 0] *= np.sqrt(0.5).astype(np.float32)
    return mfcc.T.astype(np.float32)  # (num_ceps, T)


def extract_mfcc(sig: np.ndarray, sr: int, n_mfcc: int = 20) -> np.ndarray:
    """Extract MFCCs using librosa or fallback minimal implementation."""
    x = pre_emphasis(np.asarray(sig, dtype=np.float32), alpha=0.97)
    if _HAS_LIBROSA:
        n_fft = max(int(round(30.0 * 0.001 * sr)), 256)
        hop_length = int(round(15.0 * 0.001 * sr))
        mfcc = librosa.feature.mfcc(
            y=x, sr=sr, n_mfcc=n_mfcc,
            n_fft=n_fft, hop_length=hop_length,
            n_mels=70, fmin=0, fmax=4000,
            center=False, htk=True
        )
        return mfcc.T.astype(np.float32)  # (T, n_mfcc)
    else:
        mfcc = _mfcc_minimal(x, sr, num_ceps=n_mfcc, low_freq=0, high_freq=4000, n_mels=70)
        return mfcc.T.astype(np.float32)  # (T, n_mfcc)


# ================== Dispatcher & Shape Fitting ==================
def extract_features(signal: np.ndarray, sr: int, mode: str) -> Optional[np.ndarray]:
    """
    Unified feature extraction function:
    - 'lfcc_v1': 19 LFCC + deltas + double deltas -> (57, T)
    - 'lfcc_v2': 19 LFCC + deltas + double deltas -> (57, T)
    - 'mfcc': 20 MFCC + deltas + double deltas -> (60, T)
    """
    try:
        if mode == "mfcc":
            sig = head_tail_20_concat(signal)
        else:
            sig = np.asarray(signal, dtype=np.float32)

        if mode == "lfcc_v1":
            c = extract_lfcc_v1(sig, sr, nc=19)
            static = c.T
            d1 = deltas(static)
            d2 = deltas(d1)
            feats = np.vstack([static, d1, d2])  # (57, T)

        elif mode == "lfcc_v2":
            c = extract_lfcc_v2(sig, sr, num_ceps=19)
            static = c.T
            d1 = deltas(static)
            d2 = deltas(d1)
            feats = np.vstack([static, d1, d2])  # (57, T)

        elif mode == "mfcc":
            c = extract_mfcc(sig, sr, n_mfcc=20)
            static = c.T
            d1 = deltas(static)
            d2 = deltas(d1)
            feats = np.vstack([static, d1, d2])  # (60, T)

        else:
            raise ValueError(f"Unknown feature mode: {mode}")

        return feats
    except Exception as e:
        logger.exception(f"Feature extraction ({mode}) failed: {e}")
        return None


def fit_input_shape_to_model(
    feats: np.ndarray,
    model,
    prefer_feature_bins: Optional[int] = None
) -> np.ndarray:
    """Pad, crop, or transpose features to fit model input tensor (1, H, W, 1)."""
    if feats is None:
        raise ValueError("Features array is None")
    if not hasattr(model, "input_shape") or model.input_shape is None:
        raise ValueError("Model does not specify an input_shape")

    _, H, W, C = model.input_shape
    if C != 1:
        raise ValueError(f"Model expects channel=1, got channel={C}")

    F, T = feats.shape

    def _fit_len(arr_2d: np.ndarray, target: int, axis: int) -> np.ndarray:
        cur = arr_2d.shape[axis]
        if cur > target:
            return arr_2d[:target, :] if axis == 0 else arr_2d[:, :target]
        elif cur < target:
            pad = target - cur
            return (
                np.pad(arr_2d, ((0, pad), (0, 0)), mode="constant")
                if axis == 0
                else np.pad(arr_2d, ((0, 0), (0, pad)), mode="constant")
            )
        return arr_2d

    can_map_F_to_H = (F == H) or (prefer_feature_bins == H)
    can_map_F_to_W = (F == W) or (prefer_feature_bins == W)

    if can_map_F_to_H and not can_map_F_to_W:
        chosen = "FH"
    elif can_map_F_to_W and not can_map_F_to_H:
        chosen = "FW"
    elif can_map_F_to_H and can_map_F_to_W:
        chosen = "FH" if abs(T - W) <= abs(T - H) else "FW"
    else:
        cost_FH = abs(F - H) + abs(T - W)
        cost_FW = abs(F - W) + abs(T - H)
        chosen = "FH" if cost_FH <= cost_FW else "FW"

    if chosen == "FH":
        x2d = feats.copy()
        x2d = _fit_len(x2d, H, axis=0)
        x2d = _fit_len(x2d, W, axis=1)
    else:
        x2d = feats.T.copy()
        x2d = _fit_len(x2d, H, axis=0)
        x2d = _fit_len(x2d, W, axis=1)

    return x2d[np.newaxis, ..., np.newaxis]
