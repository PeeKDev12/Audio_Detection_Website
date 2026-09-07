import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    importProvidersFrom(HttpClientModule),              // ✅ สำหรับเรียก backend API
    provideBrowserGlobalErrorListeners(),               // ✅ จับ error ที่ browser
    provideZoneChangeDetection({ eventCoalescing: true }), // ✅ ปรับ zone detection
    provideRouter(routes)                               // ✅ สำหรับ routing
  ]
};
