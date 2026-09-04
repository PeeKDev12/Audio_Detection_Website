import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionHistoryItem {
  id: number;
  filename: string;
  label: string;
  confidence: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private API_BASE = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getPredictionHistory(): Observable<PredictionHistoryItem[]> {
    return this.http.get<PredictionHistoryItem[]>(`${this.API_BASE}/history`);
  }

  deletePrediction(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/history/${id}`);
  }
}
