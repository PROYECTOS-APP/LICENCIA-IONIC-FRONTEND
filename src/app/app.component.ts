// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { BackendStatusService } from './services/backend-status.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `<ion-router-outlet></ion-router-outlet>`,
  standalone: true,
  imports: [IonRouterOutlet]
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private backendStatus: BackendStatusService
  ) {
    console.log(' AppComponent iniciado');
    console.log(' URL actual:', this.router.url);
  }

  ngOnInit() {
    // Suscribirse al estado del backend
    this.backendStatus.getBackendStatus().subscribe(isAvailable => {
      console.log(' Cambio en estado del backend:', isAvailable ? ' Disponible' : ' No disponible');
      
      if (!isAvailable) {
        const currentUrl = this.router.url;
        const publicRoutes = ['/', '/home', '/login', '/register', '/forgot-password', '/reset-password'];
        
        if (!publicRoutes.includes(currentUrl)) {
          console.log(' App: Redirigiendo a Home por backend no disponible');
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      }
    });

    // Redirigir según el estado inicial
    setTimeout(() => {
      const user = localStorage.getItem('user');
      const isAvailable = this.backendStatus.isBackendAvailable();
      
      console.log('=== ESTADO INICIAL ===');
      console.log('  - Backend:', isAvailable ? 'Disponible' : ' No disponible');
      console.log('  - Usuario:', user ? ' Sesión activa' : ' Sin sesión');
      console.log('  - URL actual:', this.router.url);
      console.log('  - API URL:', environment.apiUrl);
      console.log('========================');
      
      if (!isAvailable) {
        // Si no hay backend, siempre a Home
        console.log(' Backend no disponible, redirigiendo a Home');
        this.router.navigate(['/home'], { replaceUrl: true });
      } else if (user) {
        // Si hay usuario y backend disponible, ir al home
        console.log(' Sesión encontrada, redirigiendo a login');
        this.router.navigate(['/login'], { replaceUrl: true });
      } else {
        // Si no hay usuario y backend disponible, ir al login
        console.log('No hay sesión, redirigiendo a login');
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }, 100);
  }
}