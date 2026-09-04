import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PredictionService, PredictionHistoryItem } from './prediction.service';

type LabelType = 'Real' | 'Fake';

interface NormalizedHistoryItem extends PredictionHistoryItem {
  /** model ชัดเจน เช่น 'PA' | 'LA' | 'LFCC' (พาร์สจาก label ถ้า backend ไม่ส่งมา) */
  model?: string | null;
  /** label เพียว ๆ ไม่รวม prefix */
  pureLabel: LabelType | null;
  /** ความมั่นใจสเกล 0..1 */
  confidenceProb: number | null;
  /** ความมั่นใจสเกล 0..100 */
  confidencePct: number | null;
}

@Component({
  selector: 'app-predict-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './predict-history.html',
  styleUrls: ['./predict-history.css']
})
export class PredictionHistoryComponent implements OnInit {
  history: NormalizedHistoryItem[] = [];
  loading = false;
  errorMsg: string | null = null;

  constructor(private predictionService: PredictionService) { }

  ngOnInit(): void {
    this.loadHistory();
  }

  // ---------- Helpers: normalization ----------
  private toLabelType(s?: string | null): LabelType | null {
    const t = (s || '').toLowerCase();
    if (t.includes('real')) return 'Real';
    if (t.includes('fake')) return 'Fake';
    return null;
  }

  private parseModelAndLabel(rawLabel?: string | null): { model?: string | null; pureLabel: LabelType | null } {
    const lab = (rawLabel || '').trim();
    // รองรับรูปแบบ "PA - Real"
    if (lab.includes(' - ')) {
      const [model, lbl] = lab.split(' - ');
      return { model: model?.trim() || null, pureLabel: this.toLabelType(lbl) };
    }
    // หรือเป็น "Real"/"Fake" เพียว ๆ
    return { model: null, pureLabel: this.toLabelType(lab) };
  }

  private toNumberOrNull(x: any): number | null {
    if (x === null || x === undefined) return null;
    const n = typeof x === 'string' ? parseFloat(x.replace('%', '').trim()) : Number(x);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * รับค่า confidence จาก backend ที่อาจเป็น:
   * - prob (0..1) เก็บใน `confidence`
   * - pct (0..100) เก็บใน `confidence` หรือ `confidence_pct`
   * - string "93.00%" ในบางกรณี
   * แล้ว normalize เป็นทั้ง prob (0..1) และ pct (0..100)
   */
  private normalizeConfidence(item: PredictionHistoryItem): { prob: number | null; pct: number | null } {
    const c = this.toNumberOrNull((item as any).confidence);
    const cpct = this.toNumberOrNull((item as any).confidence_pct);

    // ถ้ามี confidence_pct เป็นตัวเลขอยู่แล้ว → เชื่อว่าเป็น 0..100
    if (cpct !== null) {
      const pct = cpct;
      const prob = pct / 100;
      return { prob, pct };
    }

    if (c === null) return { prob: null, pct: null };

    // ถ้า c > 1.0 ถือว่าเป็นเปอร์เซ็นต์ (0..100)
    if (c > 1.0) {
      const pct = c;
      const prob = pct / 100;
      return { prob, pct };
    }

    // ไม่งั้นถือว่าเป็น prob (0..1)
    return { prob: c, pct: c * 100 };
  }

  private normalizeItem(raw: PredictionHistoryItem): NormalizedHistoryItem {
    const { model, pureLabel } = this.parseModelAndLabel((raw as any).label);
    const { prob, pct } = this.normalizeConfidence(raw);

    // ถ้า backend ส่ง model แยกมาอยู่แล้ว ให้ใช้ของ backend ก่อน
    const modelFromBackend = (raw as any).model as string | undefined;

    return {
      ...raw,
      model: modelFromBackend ?? model ?? null,
      pureLabel,
      confidenceProb: prob,
      confidencePct: pct
    };
  }

  // ---------- UI Utils ----------
  normLabelShow(it: NormalizedHistoryItem): string {
    return it.pureLabel ?? (typeof (it as any).label === 'string' ? (it as any).label : '-');
  }

  modelShow(it: NormalizedHistoryItem): string {
    return it.model ?? '-';
  }

  confPctShow(it: NormalizedHistoryItem): string {
    if (it.confidencePct === null) return '-';
    return `${it.confidencePct.toFixed(2)}%`;
  }

  isCorrect(it: NormalizedHistoryItem): boolean | null {
    const gt = this.toLabelType((it as any).ground_truth);
    if (!gt || !it.pureLabel) return null;
    return gt === it.pureLabel;
  }

  trackById(_: number, it: NormalizedHistoryItem) {
    return (it as any).id ?? `${it.filename}-${it.timestamp}`;
  }

  // ---------- Data flow ----------
  loadHistory(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMsg = null;

    this.predictionService.getPredictionHistory().subscribe({
      next: (data) => {
        // map → normalize → sort ล่าสุดก่อน (ถ้ามี timestamp)
        const normalized = (data || []).map((d) => this.normalizeItem(d));
        normalized.sort((a, b) => {
          const ta = Date.parse((a as any).timestamp ?? '') || 0;
          const tb = Date.parse((b as any).timestamp ?? '') || 0;
          return tb - ta;
        });
        this.history = normalized;
        // console.log('History (normalized):', normalized);
      },
      error: (err: any) => {
        console.error('Error loading history', err);
        this.errorMsg = 'โหลดประวัติล้มเหลว';
      },
      complete: () => (this.loading = false),
    });
  }

  deleteItem(id: number): void {
    if (!id) return;
    if (!confirm('ยืนยันลบรายการนี้หรือไม่?')) return;

    // optimistic update
    const backup = this.history.slice();
    this.history = this.history.filter((item) => (item as any).id !== id);

    this.predictionService.deletePrediction(id).subscribe({
      next: () => {
        // ลบสำเร็จ เงียบ ๆ
      },
      error: (err: any) => {
        console.error(`Error deleting item id=${id}`, err);
        this.errorMsg = 'ลบไม่สำเร็จ';
        this.history = backup; // rollback
      },
    });
  }
}
