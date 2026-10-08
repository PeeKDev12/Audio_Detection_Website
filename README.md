# AASIST Audio Anti-Spoofing Web Interface

A modern, high-performance web platform built to demonstrate advanced AI-powered voice authentication and deepfake detection. Developed during research at **NECTEC**, this project transitions legacy anti-spoofing detection models into a modern, responsive full-stack architecture tailored for real-world speech verification workloads.

### ✨ Key Features
- **AASIST PyTorch Integration:** Native support for end-to-end raw audio waveform analysis (16 kHz, 64k samples) powered by Spectro-Temporal Graph Attention Networks.
- **Multi-Model Benchmark Suite:** Evaluates audio against specialized classifiers, including Thai VAJA TTS models, Meta MMS models, and baseline LFCC/MFCC architectures.
- **Bilingual Interface (EN/TH):** Fluid, instant language switching with smooth spring-physics animations.
- **Swiss Editorial Flat UI:** Clean, grid-conscious layout using 1px hairline dividers, zero heavy drop-shadows, and high-contrast typography.
- **Paginated Prediction Logs:** Efficient database-backed execution history tracking recent audio classification runs with on-demand fetching.
- **HPC & Supercomputer Ready:** Designed for deployment alongside FastAPI inference backends connected to LANTA supercomputer training pipelines.

### 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** FastAPI, PyTorch, Torchaudio, Keras / TensorFlow
