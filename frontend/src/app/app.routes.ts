import { Routes } from '@angular/router';
import { AudioPredict } from './audio-predict/audio-predict';
import { PredictionHistoryComponent } from './predict-history/predict-history';
import { AboutComponent } from './about-me/about-me';
import { ProjectOverviewComponent } from './project-overview/project-overview';
export const routes: Routes = [
  { path: '', redirectTo: 'project-overview', pathMatch: 'full' },
  { path: 'home', redirectTo: 'project-overview', pathMatch: 'full' },
  { path: 'project-overview', component: ProjectOverviewComponent },
  { path: 'audio-predict', component: AudioPredict },
  { path: 'prediction-history', component: PredictionHistoryComponent },
  { path: 'about-me', component: AboutComponent },
];
