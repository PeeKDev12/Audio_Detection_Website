import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ Navbar, RouterOutlet ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  private router = inject(Router);

  navigateToAudioPredict() {
    this.router.navigate(['/audio-predict']);
  }

}
