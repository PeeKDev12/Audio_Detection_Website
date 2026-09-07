import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  private router = inject(Router);

  navigateToAudioPredict() {
    this.router.navigate(['/audio-predict']);
  }
  navigateToPredictionHistory() {
    this.router.navigate(['/prediction-history']);
  }
  navigateToProjectOverview() {
    this.router.navigate(['/project-overview']);
  }
  navigateToHome() {
    this.router.navigate(['/']);
  }
  navigateToAboutMe() {
    this.router.navigate(['/about-me']);
  }


}
