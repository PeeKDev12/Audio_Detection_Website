#!/usr/bin/env python3
"""
Audio Deepfake & ASV Model Benchmark Evaluator
==============================================
Evaluates all machine learning models against the dataset (e.g., 'SLSCU CSS main data_samples').
Computes Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Sub-Category Style Breakdowns.

Outputs:
  - Formatted terminal evaluation tables & rankings
  - eval_results_detailed.csv (file-by-file audit log)
  - eval_summary.csv (overall model leaderboard)
  - eval_summary.json (structured benchmark data)
"""

import os
import sys
import time
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

# Ensure UTF-8 output on Windows terminal
if sys.platform == "win32":
    try:
        if sys.stdout.encoding.lower() != "utf-8":
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if sys.stderr.encoding.lower() != "utf-8":
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure backend modules are importable
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR if (CURRENT_DIR / "backend").exists() else CURRENT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Suppress noisy TensorFlow logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import numpy as np

try:
    from services.inference_service import inference_service
except ImportError as e:
    print(f"❌ Error: Failed to import inference_service from backend: {e}")
    sys.exit(1)


# ================== Dataset Scanner ==================
def scan_dataset(dataset_dir: Path) -> List[Dict[str, Any]]:
    """
    Recursively finds all audio files and assigns ground truth based on folder hierarchy.
    """
    if not dataset_dir.exists():
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    audio_extensions = {".wav", ".flac", ".mp3", ".m4a", ".ogg", ".aac"}
    samples = []

    for root, _, files in os.walk(dataset_dir):
        root_path = Path(root)
        rel_path = root_path.relative_to(dataset_dir)
        parts = rel_path.parts

        # Determine ground truth from folder path
        is_bona_fide = False
        is_spoofed = False
        category_style = "General"

        for p in parts:
            p_lower = p.lower().replace("_", " ")
            if "bona fide" in p_lower or "real" in p_lower or "genuine" in p_lower:
                is_bona_fide = True
            elif "spoof" in p_lower or "fake" in p_lower or "synth" in p_lower:
                is_spoofed = True
            
            if p.lower() in {"casual", "excited", "formal", "neutral", "angry", "happy"}:
                category_style = p.capitalize()

        if is_bona_fide:
            ground_truth = "Real"
        elif is_spoofed:
            ground_truth = "Fake"
        else:
            ground_truth = "Unknown"

        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext in audio_extensions:
                file_path = root_path / fname
                samples.append({
                    "file_path": str(file_path),
                    "filename": fname,
                    "relative_path": str(file_path.relative_to(dataset_dir)),
                    "ground_truth": ground_truth,
                    "style": category_style,
                    "file_size_bytes": file_path.stat().st_size,
                })

    return samples


# ================== Metric Calculator ==================
def compute_metrics(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates detailed classification metrics from a list of prediction records.
    """
    valid = [r for r in results if r.get("ground_truth") in ("Real", "Fake") and not r.get("error")]
    if not valid:
        return {"error": "No valid evaluated samples with ground truth"}

    total = len(valid)
    tp = sum(1 for r in valid if r["ground_truth"] == "Fake" and r["predicted_label"] == "Fake")
    tn = sum(1 for r in valid if r["ground_truth"] == "Real" and r["predicted_label"] == "Real")
    fp = sum(1 for r in valid if r["ground_truth"] == "Real" and r["predicted_label"] == "Fake")  # False Alarm
    fn = sum(1 for r in valid if r["ground_truth"] == "Fake" and r["predicted_label"] == "Real")  # Miss

    total_fake = tp + fn
    total_real = tn + fp
    correct = tp + tn

    accuracy = (correct / total) * 100.0 if total > 0 else 0.0

    # Fake (Positive) metrics
    precision_fake = (tp / (tp + fp)) * 100.0 if (tp + fp) > 0 else 0.0
    recall_fake = (tp / total_fake) * 100.0 if total_fake > 0 else 0.0
    f1_fake = (2 * precision_fake * recall_fake / (precision_fake + recall_fake)) if (precision_fake + recall_fake) > 0 else 0.0

    # Real (Negative) metrics
    precision_real = (tn / (tn + fn)) * 100.0 if (tn + fn) > 0 else 0.0
    recall_real = (tn / total_real) * 100.0 if total_real > 0 else 0.0
    f1_real = (2 * precision_real * recall_real / (precision_real + recall_real)) if (precision_real + recall_real) > 0 else 0.0

    macro_f1 = (f1_fake + f1_real) / 2.0

    # Error Rates (ASV Standard)
    far_fpr = (fp / total_real) * 100.0 if total_real > 0 else 0.0  # False Alarm Rate
    frr_fnr = (fn / total_fake) * 100.0 if total_fake > 0 else 0.0  # Miss Rate

    # Average Confidence
    avg_conf = np.mean([r["confidence_pct"] for r in valid]) if valid else 0.0
    avg_latency_ms = np.mean([r["inference_time_ms"] for r in valid]) if valid else 0.0

    # Breakdown by Style
    styles = sorted(list(set(r.get("style", "General") for r in valid)))
    style_breakdown = {}
    for st in styles:
        st_samples = [r for r in valid if r.get("style") == st]
        st_correct = sum(1 for r in st_samples if r["is_correct"])
        st_total = len(st_samples)
        st_real = sum(1 for r in st_samples if r["ground_truth"] == "Real")
        st_fake = sum(1 for r in st_samples if r["ground_truth"] == "Fake")
        st_acc = (st_correct / st_total * 100.0) if st_total > 0 else 0.0
        style_breakdown[st] = {
            "total": st_total,
            "real_count": st_real,
            "fake_count": st_fake,
            "correct": st_correct,
            "accuracy_pct": round(st_acc, 2),
        }

    return {
        "total_samples": total,
        "correct_predictions": correct,
        "accuracy_pct": round(accuracy, 2),
        "total_real": total_real,
        "true_real_tn": tn,
        "false_fake_fp": fp,
        "real_accuracy_recall_pct": round(recall_real, 2),
        "total_fake": total_fake,
        "true_fake_tp": tp,
        "false_real_fn": fn,
        "fake_accuracy_recall_pct": round(recall_fake, 2),
        "precision_fake_pct": round(precision_fake, 2),
        "precision_real_pct": round(precision_real, 2),
        "f1_fake": round(f1_fake, 2),
        "f1_real": round(f1_real, 2),
        "macro_f1_pct": round(macro_f1, 2),
        "far_false_alarm_rate_pct": round(far_fpr, 2),
        "frr_miss_rate_pct": round(frr_fnr, 2),
        "avg_confidence_pct": round(avg_conf, 2),
        "avg_latency_ms": round(avg_latency_ms, 2),
        "style_breakdown": style_breakdown,
    }


# ================== Main Evaluator Runner ==================
def run_evaluation(
    dataset_dir: Path,
    selected_models: Optional[List[str]] = None,
    output_dir: Path = Path("eval_output"),
    verbose: bool = False,
):
    print("=" * 80)
    print(" 🎙️ AUDIO DEEPFAKE & ASV MODEL BENCHMARK EVALUATION")
    print("=" * 80)
    print(f"📂 Target Dataset: {dataset_dir.resolve()}")
    print(f"📁 Output Directory: {output_dir.resolve()}")
    
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Scan Dataset
    samples = scan_dataset(dataset_dir)
    if not samples:
        print(f"❌ Error: No audio files found in {dataset_dir}")
        return

    real_count = sum(1 for s in samples if s["ground_truth"] == "Real")
    fake_count = sum(1 for s in samples if s["ground_truth"] == "Fake")
    unknown_count = sum(1 for s in samples if s["ground_truth"] == "Unknown")

    print(f"📊 Dataset Audio Inventory:")
    print(f"   • Total Files: {len(samples)}")
    print(f"   • Bona fide (Real): {real_count}")
    print(f"   • Spoofed (Fake): {fake_count}")
    if unknown_count > 0:
        print(f"   • Unlabeled (Unknown): {unknown_count}")

    # Unique styles
    styles = sorted(list(set(s["style"] for s in samples)))
    print(f"   • Detected Speaking Styles: {', '.join(styles)}")
    print("-" * 80)

    # 2. Load Models
    print("⏳ Loading Machine Learning Models...")
    inference_service.load_models()
    available_models = list(inference_service.models.keys())
    print(f"✅ Models Ready ({len(available_models)}): {', '.join(available_models)}")

    models_to_test = selected_models if selected_models else available_models
    models_to_test = [m for m in models_to_test if m in available_models]

    if not models_to_test:
        print("❌ Error: No valid loaded models selected for evaluation.")
        return

    print(f"🎯 Evaluating Models: {', '.join(models_to_test)}")
    print("=" * 80)

    # 3. Execute Inference across all samples and models
    all_detailed_results = []
    summary_by_model = {}

    for m_idx, model_key in enumerate(models_to_test, 1):
        print(f"\n[{m_idx}/{len(models_to_test)}] 🚀 Evaluating Model: {model_key} ...")
        model_results = []

        start_time = time.time()
        for idx, sample in enumerate(samples, 1):
            fpath = sample["file_path"]
            fname = sample["filename"]
            gt = sample["ground_truth"]
            style = sample["style"]

            try:
                with open(fpath, "rb") as af:
                    file_bytes = af.read()

                t0 = time.time()
                pred = inference_service._predict_single_sync(
                    file_bytes=file_bytes,
                    filename=fname,
                    model_key=model_key,
                )
                latency_ms = (time.time() - t0) * 1000.0

                if "error" in pred:
                    record = {
                        "file_path": fpath,
                        "filename": fname,
                        "relative_path": sample["relative_path"],
                        "style": style,
                        "ground_truth": gt,
                        "model": model_key,
                        "predicted_label": "Error",
                        "confidence": 0.0,
                        "confidence_pct": 0.0,
                        "is_correct": False,
                        "inference_time_ms": round(latency_ms, 2),
                        "error": pred["error"],
                    }
                else:
                    pred_label = pred.get("label", "Unknown")
                    is_correct = (pred_label == gt) if gt in ("Real", "Fake") else False
                    record = {
                        "file_path": fpath,
                        "filename": fname,
                        "relative_path": sample["relative_path"],
                        "style": style,
                        "ground_truth": gt,
                        "model": model_key,
                        "predicted_label": pred_label,
                        "confidence": pred.get("confidence", 0.0),
                        "confidence_pct": pred.get("confidence_pct", 0.0),
                        "is_correct": is_correct,
                        "inference_time_ms": round(latency_ms, 2),
                        "error": None,
                    }

            except Exception as e:
                record = {
                    "file_path": fpath,
                    "filename": fname,
                    "relative_path": sample["relative_path"],
                    "style": style,
                    "ground_truth": gt,
                    "model": model_key,
                    "predicted_label": "Exception",
                    "confidence": 0.0,
                    "confidence_pct": 0.0,
                    "is_correct": False,
                    "inference_time_ms": 0.0,
                    "error": str(e),
                }

            model_results.append(record)
            all_detailed_results.append(record)

            if verbose:
                status_symbol = "✅" if record["is_correct"] else "❌"
                print(f"   [{idx:03d}/{len(samples):03d}] {status_symbol} {fname} | GT: {gt:<4} -> Pred: {record['predicted_label']:<4} ({record['confidence_pct']:.1f}%) | {latency_ms:.1f}ms")

        elapsed_sec = time.time() - start_time
        metrics = compute_metrics(model_results)
        summary_by_model[model_key] = metrics
        summary_by_model[model_key]["total_eval_time_sec"] = round(elapsed_sec, 2)

        print(f"   ⏱️ Finished {len(samples)} files in {elapsed_sec:.2f}s (Avg {metrics.get('avg_latency_ms', 0):.1f}ms/file)")
        print(f"   🎯 Accuracy: {metrics.get('accuracy_pct', 0):.2f}% | Macro F1: {metrics.get('macro_f1_pct', 0):.2f}% | Real Acc: {metrics.get('real_accuracy_recall_pct', 0):.2f}% | Fake Acc: {metrics.get('fake_accuracy_recall_pct', 0):.2f}%")

    # 4. Display Leaderboard & Comparison Tables
    print("\n" + "=" * 96)
    print(" 🏆 MODEL PERFORMANCE LEADERBOARD (RANKED BY ACCURACY)")
    print("=" * 96)
    header = f"{'Rank':<5} {'Model Name':<14} {'Accuracy':<10} {'Macro F1':<10} {'Real Recall':<13} {'Fake Recall':<13} {'FAR (%)':<9} {'FRR (%)':<9} {'Avg Latency':<11}"
    print(header)
    print("-" * 96)

    # Sort models by accuracy descending
    ranked_models = sorted(
        summary_by_model.items(),
        key=lambda x: (x[1].get("accuracy_pct", 0), x[1].get("macro_f1_pct", 0)),
        reverse=True
    )

    for rank, (m_name, m_stats) in enumerate(ranked_models, 1):
        acc = f"{m_stats.get('accuracy_pct', 0):.2f}%"
        f1 = f"{m_stats.get('macro_f1_pct', 0):.2f}%"
        r_rec = f"{m_stats.get('real_accuracy_recall_pct', 0):.2f}%"
        f_rec = f"{m_stats.get('fake_accuracy_recall_pct', 0):.2f}%"
        far = f"{m_stats.get('far_false_alarm_rate_pct', 0):.2f}%"
        frr = f"{m_stats.get('frr_miss_rate_pct', 0):.2f}%"
        lat = f"{m_stats.get('avg_latency_ms', 0):.1f} ms"
        print(f"#{rank:<4} {m_name:<14} {acc:<10} {f1:<10} {r_rec:<13} {f_rec:<13} {far:<9} {frr:<9} {lat:<11}")

    print("=" * 96)

    # 5. Display Speaking Style Breakdown Table
    if styles:
        print("\n" + "=" * 96)
        print(" 🎭 SPEAKING STYLE ACCURACY MATRIX (% Correct)")
        print("=" * 96)
        style_header = f"{'Model Name':<16}" + "".join([f"{st:<16}" for st in styles]) + f"{'Overall Acc':<14}"
        print(style_header)
        print("-" * 96)

        for m_name, m_stats in ranked_models:
            row_str = f"{m_name:<16}"
            for st in styles:
                st_data = m_stats.get("style_breakdown", {}).get(st, {})
                st_acc = st_data.get("accuracy_pct", 0.0)
                row_str += f"{st_acc:.2f}%{' ' * 9}"
            row_str += f"{m_stats.get('accuracy_pct', 0):.2f}%"
            print(row_str)
        print("=" * 96)

    # 6. Save Artifacts (CSV & JSON)
    detailed_csv_path = output_dir / "eval_results_detailed.csv"
    summary_csv_path = output_dir / "eval_summary.csv"
    summary_json_path = output_dir / "eval_summary.json"

    # Save detailed CSV
    import csv
    with open(detailed_csv_path, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "filename", "relative_path", "style", "ground_truth",
            "model", "predicted_label", "confidence_pct", "confidence_raw",
            "is_correct", "inference_time_ms", "error", "file_path"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in all_detailed_results:
            writer.writerow({
                "filename": r["filename"],
                "relative_path": r["relative_path"],
                "style": r["style"],
                "ground_truth": r["ground_truth"],
                "model": r["model"],
                "predicted_label": r["predicted_label"],
                "confidence_pct": r["confidence_pct"],
                "confidence_raw": r["confidence"],
                "is_correct": r["is_correct"],
                "inference_time_ms": r["inference_time_ms"],
                "error": r["error"],
                "file_path": r["file_path"],
            })

    # Save summary CSV
    with open(summary_csv_path, "w", newline="", encoding="utf-8") as f:
        summary_fields = [
            "rank", "model", "accuracy_pct", "macro_f1_pct", "real_accuracy_pct",
            "fake_accuracy_pct", "precision_real_pct", "precision_fake_pct",
            "f1_real", "f1_fake", "false_alarm_rate_pct", "miss_rate_pct",
            "total_samples", "true_real_tn", "false_fake_fp", "true_fake_tp",
            "false_real_fn", "avg_confidence_pct", "avg_latency_ms", "total_eval_time_sec"
        ]
        # Add styles
        for st in styles:
            summary_fields.append(f"style_{st.lower()}_acc_pct")

        writer = csv.DictWriter(f, fieldnames=summary_fields)
        writer.writeheader()
        for rank, (m_name, m_stats) in enumerate(ranked_models, 1):
            row = {
                "rank": rank,
                "model": m_name,
                "accuracy_pct": m_stats.get("accuracy_pct", 0),
                "macro_f1_pct": m_stats.get("macro_f1_pct", 0),
                "real_accuracy_pct": m_stats.get("real_accuracy_recall_pct", 0),
                "fake_accuracy_pct": m_stats.get("fake_accuracy_recall_pct", 0),
                "precision_real_pct": m_stats.get("precision_real_pct", 0),
                "precision_fake_pct": m_stats.get("precision_fake_pct", 0),
                "f1_real": m_stats.get("f1_real", 0),
                "f1_fake": m_stats.get("f1_fake", 0),
                "false_alarm_rate_pct": m_stats.get("far_false_alarm_rate_pct", 0),
                "miss_rate_pct": m_stats.get("frr_miss_rate_pct", 0),
                "total_samples": m_stats.get("total_samples", 0),
                "true_real_tn": m_stats.get("true_real_tn", 0),
                "false_fake_fp": m_stats.get("false_fake_fp", 0),
                "true_fake_tp": m_stats.get("true_fake_tp", 0),
                "false_real_fn": m_stats.get("false_real_fn", 0),
                "avg_confidence_pct": m_stats.get("avg_confidence_pct", 0),
                "avg_latency_ms": m_stats.get("avg_latency_ms", 0),
                "total_eval_time_sec": m_stats.get("total_eval_time_sec", 0),
            }
            for st in styles:
                st_acc = m_stats.get("style_breakdown", {}).get(st, {}).get("accuracy_pct", 0)
                row[f"style_{st.lower()}_acc_pct"] = st_acc
            writer.writerow(row)

    # Save summary JSON
    with open(summary_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "dataset": str(dataset_dir),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_audio_samples": len(samples),
            "bona_fide_count": real_count,
            "spoofed_count": fake_count,
            "styles_evaluated": styles,
            "models_ranked": [
                {"rank": rank, "model": m_name, **m_stats}
                for rank, (m_name, m_stats) in enumerate(ranked_models, 1)
            ]
        }, f, indent=2)

    print(f"\n💾 Evaluation Artifacts Generated Successfully:")
    print(f"   📄 Detailed Per-File Audit Log : {detailed_csv_path.resolve()}")
    print(f"   📊 Model Leaderboard Summary  : {summary_csv_path.resolve()}")
    print(f"   📈 Machine-Readable JSON Data : {summary_json_path.resolve()}")
    print("=" * 96 + "\n")


# ================== CLI Entrypoint ==================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Benchmark and evaluate all deepfake audio detection models against a dataset."
    )
    parser.add_argument(
        "-d", "--dataset_dir",
        type=str,
        default="SLSCU CSS main data_samples",
        help="Path to the dataset directory (default: 'SLSCU CSS main data_samples')",
    )
    parser.add_argument(
        "-m", "--models",
        nargs="+",
        default=None,
        help="List of specific models to evaluate (e.g., -m AASIST LFCC_VAJA PA LA). Default: all loaded models.",
    )
    parser.add_argument(
        "-o", "--output_dir",
        type=str,
        default="eval_output",
        help="Directory to save evaluation reports and CSV logs (default: 'eval_output')",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Print real-time per-file evaluation status in terminal.",
    )

    args = parser.parse_args()
    dataset_path = Path(args.dataset_dir)
    if not dataset_path.is_absolute() and not dataset_path.exists():
        if (CURRENT_DIR / dataset_path).exists():
            dataset_path = CURRENT_DIR / dataset_path
        elif (PROJECT_ROOT / dataset_path).exists():
            dataset_path = PROJECT_ROOT / dataset_path

    out_path = Path(args.output_dir)
    if not out_path.is_absolute() and not out_path.exists():
        if (CURRENT_DIR / out_path).exists() or not out_path.parent.exists():
            out_path = CURRENT_DIR / out_path

    run_evaluation(
        dataset_dir=dataset_path,
        selected_models=args.models,
        output_dir=out_path,
        verbose=args.verbose,
    )
