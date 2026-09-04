import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type LabelType = 'Real' | 'Fake';

interface BackendPredictionItem {
  filename: string;
  label: string;
  confidence?: number;       // 0..1
  confidence_pct?: number;   // 0..100
  error?: string;

  // optional metrics (if backend decides to include someday)
  eer?: number; threshold?: number; accuracy?: number;
  precision?: number; recall?: number; f1?: number; dcf?: number;
}

type ModelKey = 'PA' | 'LA' | 'LFCCMMS' | 'MFCCMMS' | 'LFCCVAJA' | 'MFCCVAJA' | 'LFCC';

@Component({
  selector: 'app-audio-predict',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './audio-predict.html',
  styleUrls: ['./audio-predict.css'],
})
export class AudioPredict {
  // ===== Upload state =====
  selectedFile: File | null = null;
  audioUrl: string | null = null;
  loading = false;

  lastFilename: string | null = null;
  errorMsg: string | null = null;

  // ===== Results by model =====
  paItems: BackendPredictionItem[] = [];
  laItems: BackendPredictionItem[] = [];
  lfccMmsItems: BackendPredictionItem[] = [];
  mfccMmsItems: BackendPredictionItem[] = [];
  lfccVajaItems: BackendPredictionItem[] = [];
  mfccVajaItems: BackendPredictionItem[] = [];
  lfccItems: BackendPredictionItem[] = [];            // <-- /predict_lfcc_1

  // ===== Row expand flags =====
  openPA = false;
  openLA = false;
  openLFCCMMS = false;
  openMFCCMMS = false;
  openLFCCVAJA = false;
  openMFCCVAJA = false;
  openLFCC = false;                                   // <-- LFCC generic

  // ===== Inline panel flags =====
  // PA
  openTrainWithPA = false; openAccuracyPA = false;
  // LA
  openTrainWithLA = false; openAccuracyLA = false;
  // LFCC-MMS
  openTrainWithLFCCMMS = false; openAccuracyLFCCMMS = false;
  // MFCC-MMS
  openTrainWithMFCCMMS = false; openAccuracyMFCCMMS = false;
  // LFCC-VAJA
  openTrainWithLFCCVAJA = false; openAccuracyLFCCVAJA = false;
  // MFCC-VAJA
  openTrainWithMFCCVAJA = false; openAccuracyMFCCVAJA = false;
  // LFCC generic
  openTrainWithLFCC = false; openAccuracyLFCC = false;

  // ===== Customizable texts =====
  // PA
  trainWithMsgPA = 'Feature: LFCC (57,600)\nClasstifier: ResNet34\ndataset: ASVSpoof 2019\nSpooftype: Replay';
  accMsgPA = 'EER: 0.41\nACC: 90.84\nPrecision: 90.86\nRecall: 90.82\nF1: 90.84\nDCF: 9.16';

  // LA
  trainWithMsgLA = 'Feature: LFCC (57,746)\nClasstifier: ResNet34\ndataset: ASVSpoof 2019\nSpooftype: Logical Access';
  accMsgLA = 'EER: 0.41\nACC: 99.59\nPrecision: 99.59\nRecall: 99.59\nF1: 99.59\nDCF: 0.41';

  // LFCC-MMS
  trainWithMsgLFCCMMS = ' test Feature: LFCC\nClasstifier: LCNN\ndataset: MMS + Genuine\nSpoof_type: Mixed';
  accMsgLFCCMMS = 'EER: 0.34\nACC: 99.46\nPrecision: 98.64\nRecall: 99.79\nF1: 99.48\nDCF: 0.26';

  // MFCC-MMS
  trainWithMsgMFCCMMS = 'Feature: MFCC\nClasstifier: LCNN\ndataset: MMS + Genuine\nSpoof_type: Mixed';
  accMsgMFCCMMS = 'EER: 0.14\nACC: 96.20\nPrecision: 99.61\nRecall: 92.47\nF1: 95.91\nDCF: 0.11';

  // LFCC-VAJA
  trainWithMsgLFCCVAJA = 'Feature: LFCC\nClasstifier: LCNN\ndataset: VAJA + Genuine\nSpoof_type: Replay';
  accMsgLFCCVAJA = 'EER: 0.18\nACC: 100\nPrecision: 0\nRecall: 0\nF1: \nDCF: 0.97';

  // MFCC-VAJA
  trainWithMsgMFCCVAJA = 'Feature: MFCC\nClasstifier: LCNN\ndataset: VAJA + Genuine\nSpoof_type: Replay';
  accMsgMFCCVAJA = 'EER: 0\nACC: 100\nPrecision: 1\nRecall: 99.35\nF1: 99.67\nDCF: 0';

  // LFCC generic (/predict_lfcc_1)
  trainWithMsgLFCC = 'Feature: LFCC\nClasstifier: LCNN\ndataset: Mixed \nSpoof_type: Mixed';
  accMsgLFCC = 'EER: 0.13\nACC: 98.5\nPrecision: 98.32\nRecall: 99.84\nF1: 98.47\nDCF: 0.18';

  // (optional) sort flags
  sort: Record<ModelKey, { trainedAsc: boolean; confidenceAsc: boolean }> = {
    PA: { trainedAsc: true, confidenceAsc: true },
    LA: { trainedAsc: true, confidenceAsc: true },
    LFCCMMS: { trainedAsc: true, confidenceAsc: true },
    MFCCMMS: { trainedAsc: true, confidenceAsc: true },
    LFCCVAJA: { trainedAsc: true, confidenceAsc: true },
    MFCCVAJA: { trainedAsc: true, confidenceAsc: true },
    LFCC: { trainedAsc: true, confidenceAsc: true },
  };

  private readonly API_URL = 'http://localhost:8000';
  constructor(private http: HttpClient) { }

  // ===== Upload =====
  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];
    this.errorMsg = null;
    this.lastFilename = null;

    this.resetResults();

    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
    this.audioUrl = URL.createObjectURL(this.selectedFile);
  }

  detailOpen: Record<string, boolean> = {};
  toggleDetail(modelKey: string) { this.detailOpen[modelKey] = !this.detailOpen[modelKey]; }

  clearFile(fileInput: HTMLInputElement) {
    fileInput.value = '';
    this.selectedFile = null;
    this.lastFilename = null;
    this.errorMsg = null;

    this.resetResults();

    if (this.audioUrl) { URL.revokeObjectURL(this.audioUrl); this.audioUrl = null; }
  }

  private resetResults() {
    this.paItems = [];
    this.laItems = [];
    this.lfccMmsItems = [];
    this.mfccMmsItems = [];
    this.lfccVajaItems = [];
    this.mfccVajaItems = [];
    this.lfccItems = [];

    // close all panels
    this.openPA = this.openLA = this.openLFCCMMS = this.openMFCCMMS = this.openLFCCVAJA = this.openMFCCVAJA = this.openLFCC = false;
    this.openTrainWithPA = this.openAccuracyPA = false;
    this.openTrainWithLA = this.openAccuracyLA = false;
    this.openTrainWithLFCCMMS = this.openAccuracyLFCCMMS = false;
    this.openTrainWithMFCCMMS = this.openAccuracyMFCCMMS = false;
    this.openTrainWithLFCCVAJA = this.openAccuracyLFCCVAJA = false;
    this.openTrainWithMFCCVAJA = this.openAccuracyMFCCVAJA = false;
    this.openTrainWithLFCC = this.openAccuracyLFCC = false;
  }

  // ===== Predict =====
  submitFile() {
    if (!this.selectedFile || this.loading) return;

    this.loading = true;
    this.errorMsg = null;
    this.lastFilename = this.selectedFile.name;

    const form = new FormData();
    form.append('files', this.selectedFile, this.selectedFile.name);

    // helper: POST to endpoint, return [] on any error (so other models still show)
    const postOrEmpty = (path: string) =>
      this.http.post<BackendPredictionItem[]>(`${this.API_URL}${path}`, form).pipe(
        catchError((err: HttpErrorResponse) => {
          console.warn(`Endpoint ${path} failed:`, err?.message || err);
          return of<BackendPredictionItem[]>([]);
        })
      );

    const reqPA = postOrEmpty('/predict_pa');
    const reqLA = postOrEmpty('/predict_la');
    const reqLF = postOrEmpty('/predict_lfcc_mms');
    const reqMF = postOrEmpty('/predict_mfcc_mms');
    const reqLV = postOrEmpty('/predict_lfcc_vaja');
    const reqMV = postOrEmpty('/predict_mfcc_vaja');
    const reqL1 = postOrEmpty('/predict_lfcc_1');       // LFCC generic

    forkJoin([reqPA, reqLA, reqLF, reqMF, reqLV, reqMV, reqL1]).subscribe({
      next: ([pa, la, lfccMms, mfccMms, lfccVaja, mfccVaja, lfcc]) => {
        this.paItems = Array.isArray(pa) ? pa : [];
        this.laItems = Array.isArray(la) ? la : [];
        this.lfccMmsItems = Array.isArray(lfccMms) ? lfccMms : [];
        this.mfccMmsItems = Array.isArray(mfccMms) ? mfccMms : [];
        this.lfccVajaItems = Array.isArray(lfccVaja) ? lfccVaja : [];
        this.mfccVajaItems = Array.isArray(mfccVaja) ? mfccVaja : [];
        this.lfccItems = Array.isArray(lfcc) ? lfcc : [];
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.errorMsg = 'Prediction failed.';
      },
      complete: () => (this.loading = false),
    });
  }

  // ===== Helpers =====
  private pick(items: BackendPredictionItem[]): BackendPredictionItem | undefined {
    if (!items?.length) return undefined;
    if (!this.lastFilename) return items[0];
    return items.find(x => x.filename === this.lastFilename) ?? items[0];
  }

  get paItem() { return this.pick(this.paItems); }
  get laItem() { return this.pick(this.laItems); }
  get lfccMmsItem() { return this.pick(this.lfccMmsItems); }
  get mfccMmsItem() { return this.pick(this.mfccMmsItems); }
  get lfccVajaItem() { return this.pick(this.lfccVajaItems); }
  get mfccVajaItem() { return this.pick(this.mfccVajaItems); }
  get lfccItem() { return this.pick(this.lfccItems); }  // LFCC generic

  normLabel(s?: string): LabelType {
    const t = (s || '').toLowerCase();
    if (t.includes('real')) return 'Real';
    if (t.includes('fake')) return 'Fake';
    return 'Fake';
  }

  toPct(item?: BackendPredictionItem | null): number | null {
    if (!item) return null;
    if (typeof item.confidence_pct === 'number') return item.confidence_pct;
    if (typeof item.confidence === 'number') return item.confidence * 100;
    return null;
  }

  // ===== Toggle: detail rows =====
  togglePA() { this.openPA = !this.openPA; }
  toggleLA() { this.openLA = !this.openLA; }
  toggleLFCCMMS() { this.openLFCCMMS = !this.openLFCCMMS; }
  toggleMFCCMMS() { this.openMFCCMMS = !this.openMFCCMMS; }
  toggleLFCCVAJA() { this.openLFCCVAJA = !this.openLFCCVAJA; }
  toggleMFCCVAJA() { this.openMFCCVAJA = !this.openMFCCVAJA; }
  toggleLFCC() { this.openLFCC = !this.openLFCC; }

  // ===== Toggle: inline panels =====
  toggleTrainWithPA() { this.openTrainWithPA = !this.openTrainWithPA; }
  toggleAccuracyPA() { this.openAccuracyPA = !this.openAccuracyPA; }
  toggleTrainWithLA() { this.openTrainWithLA = !this.openTrainWithLA; }
  toggleAccuracyLA() { this.openAccuracyLA = !this.openAccuracyLA; }
  toggleTrainWithLFCCMMS() { this.openTrainWithLFCCMMS = !this.openTrainWithLFCCMMS; }
  toggleAccuracyLFCCMMS() { this.openAccuracyLFCCMMS = !this.openAccuracyLFCCMMS; }
  toggleTrainWithMFCCMMS() { this.openTrainWithMFCCMMS = !this.openTrainWithMFCCMMS; }
  toggleAccuracyMFCCMMS() { this.openAccuracyMFCCMMS = !this.openAccuracyMFCCMMS; }
  toggleTrainWithLFCCVAJA() { this.openTrainWithLFCCVAJA = !this.openTrainWithLFCCVAJA; }
  toggleAccuracyLFCCVAJA() { this.openAccuracyLFCCVAJA = !this.openAccuracyLFCCVAJA; }
  toggleTrainWithMFCCVAJA() { this.openTrainWithMFCCVAJA = !this.openTrainWithMFCCVAJA; }
  toggleAccuracyMFCCVAJA() { this.openAccuracyMFCCVAJA = !this.openAccuracyMFCCVAJA; }
  toggleTrainWithLFCC() { this.openTrainWithLFCC = !this.openTrainWithLFCC; }
  toggleAccuracyLFCC() { this.openAccuracyLFCC = !this.openAccuracyLFCC; }

  // (optional) header sort toggles
  toggleSort(column: 'trained' | 'confidence', model: ModelKey) {
    const s = this.sort[model];
    if (!s) return;
    if (column === 'trained') s.trainedAsc = !s.trainedAsc;
    else if (column === 'confidence') s.confidenceAsc = !s.confidenceAsc;
  }
}
