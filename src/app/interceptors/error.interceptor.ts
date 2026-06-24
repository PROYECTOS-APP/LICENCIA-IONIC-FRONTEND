// src/app/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BackendStatusService } from '../services/backend-status.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private backendStatus: BackendStatusService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No interceptar el health check
    if (req.url.includes('/health')) {
      return next.handle(req);
    }

    console.log(' Interceptando petición:', req.url);

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error HTTP interceptado:');
        console.error('  - URL:', req.url);
        console.error('  - Status:', error.status);
        console.error('  - Message:', error.message);
        
        // Error de conexión o timeout
        if (error.status === 0 || error.status === 504) {
          console.warn('Backend no disponible en interceptor');
          this.backendStatus.forceCheck();
          
          // Si no es una petición de autenticación, redirigir a Home
          if (!req.url.includes('/auth') && !req.url.includes('/health')) {
            console.log('Redirigiendo a Home desde interceptor');
            this.router.navigate(['/home'], { replaceUrl: true });
          }
        }
        
        // Error de CORS
        if (error.status === 403) {
          console.error(' Error CORS - Revisa la configuración en Spring Boot');
        }
        
        return throwError(() => error);
      })
    );
  }
}