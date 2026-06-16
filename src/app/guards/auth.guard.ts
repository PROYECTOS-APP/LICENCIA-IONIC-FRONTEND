import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = localStorage.getItem('user');
    
    if (user) {
      console.log('✅ AuthGuard: Usuario autenticado');
      return true;
    }
    
    console.log('❌ AuthGuard: No autenticado, redirigiendo a login');
    // Reemplazar el historial para que no se pueda volver a la página anterior
    this.router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }
}