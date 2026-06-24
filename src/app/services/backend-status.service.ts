// src/app/services/backend-status.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { catchError, timeout, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BackendStatusService {
  private backendAvailable = new BehaviorSubject<boolean>(true);
  private readonly CHECK_INTERVAL = 5000;
  private isRedirecting = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log(' BackendStatusService inicializado');
    console.log(' API URL:', environment.apiUrl);
    this.startHealthCheck();
  }

  checkBackendHealth(): Observable<boolean> {
    const url = `${environment.apiUrl}/health`;
    console.log(' Verificando salud del backend...');
    console.log(' URL completa:', url);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(url, {
      headers: headers,
      withCredentials: true
    })
    .pipe(
      timeout(5000), // 5 segundos de timeout
      map((response: any) => {
        console.log('Backend disponible:', response);
        console.log('Status:', response.status);
        console.log(' Timestamp:', response.timestamp);
        return true;
      }),
      catchError((error) => {
        console.warn(' Backend NO disponible');
        
        if (error.status === 0) {
          console.warn(' Error de conexión - Backend no está corriendo');
          console.warn(' Verifica que el backend esté en el puerto 8081');
        } else if (error.status === 404) {
          console.warn('Endpoint /health no encontrado');
          console.warn('Revisa que el HealthController esté creado y mapeado');
        } else if (error.status === 403) {
          console.warn(' Error CORS - Revisa la configuración CORS');
        } else {
          console.warn(' Error:', error.status, error.message);
          console.warn(' Detalles:', error.error);
        }
        
        return [false];
      })
    );
  }

  private startHealthCheck(): void {
    // Verificación inicial después de 1 segundo
    setTimeout(() => {
      this.checkBackendHealth().subscribe(
        available => {
          this.backendAvailable.next(available);
          if (!available && !this.isRedirecting) {
            this.redirectToHome();
          }
        }
      );
    }, 1000);

    // Verificaciones periódicas
    timer(this.CHECK_INTERVAL, this.CHECK_INTERVAL).pipe(
      switchMap(() => this.checkBackendHealth())
    ).subscribe(
      available => {
        this.backendAvailable.next(available);
        if (!available && !this.isRedirecting) {
          this.redirectToHome();
        }
      }
    );
  }

  private redirectToHome(): void {
    this.isRedirecting = true;
    const currentUrl = this.router.url;
    
    console.log('URL actual:', currentUrl);
    
    // No redirigir si ya está en Home o Login
    const publicRoutes = ['/', '/home', '/login', '/register', '/forgot-password', '/reset-password'];
    
    if (!publicRoutes.includes(currentUrl)) {
      console.log(' Redirigiendo a Home (backend no disponible)');
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      console.log('Ya estás en una ruta pública, no es necesario redirigir');
    }
    
    setTimeout(() => {
      this.isRedirecting = false;
    }, 1000);
  }

  getBackendStatus(): Observable<boolean> {
    return this.backendAvailable.asObservable();
  }

  isBackendAvailable(): boolean {
    const available = this.backendAvailable.getValue();
    console.log(' Estado actual del backend:', available ? ' Disponible' : ' No disponible');
    return available;
  }

  forceCheck(): void {
    console.log(' Forzando verificación del backend...');
    this.checkBackendHealth().subscribe(
      available => {
        this.backendAvailable.next(available);
        console.log(' Nuevo estado:', available ? ' Disponible' : ' No disponible');
      }
    );
  }
}