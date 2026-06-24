// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendStatusService } from '../services/backend-status.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private backendStatus: BackendStatusService
  ) {}

  async canActivate(): Promise<boolean> {
    console.log(' AuthGuard ejecutado');
    
    // Verificar si el backend está disponible
    const backendAvailable = this.backendStatus.isBackendAvailable();
    
    if (!backendAvailable) {
      console.log('AuthGuard: Backend no disponible, redirigiendo a Home');
      this.router.navigate(['/home'], { replaceUrl: true });
      return false;
    }

    // Verificar si el usuario está autenticado
    const user = localStorage.getItem('user');
    
    if (user) {
      console.log(' AuthGuard: Usuario autenticado');
      return true;
    }
    
    console.log(' AuthGuard: No autenticado, redirigiendo a login');
    this.router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
}