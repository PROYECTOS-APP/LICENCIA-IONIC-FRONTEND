// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackendStatusService } from './backend-status.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private backendStatus: BackendStatusService,
    private router: Router
  ) {
    console.log('ApiService inicializado');
  }

  private async ensureBackendAvailable(): Promise<boolean> {
    const available = this.backendStatus.isBackendAvailable();
    if (!available) {
      console.warn('Backend no disponible, redirigiendo a Home');
      this.router.navigate(['/home'], { replaceUrl: true });
      return false;
    }
    return true;
  }

  async crearLicencia(data: any): Promise<any> {
    console.log('Creando licencia...');
    
    if (!await this.ensureBackendAvailable()) {
      return { success: false, message: 'Servidor no disponible' };
    }

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/licencias/crear`, data, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      
      console.log('Licencia creada:', response);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Error al crear licencia:', error);
      
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        this.router.navigate(['/home'], { replaceUrl: true });
        return { success: false, message: 'Servidor no disponible' };
      }
      
      if (error.status === 401) {
        return { success: false, message: 'No autenticado. Inicia sesión nuevamente.' };
      }
      
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  async getMisLicencias(): Promise<any[]> {
    console.log('Obteniendo licencias...');
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/licencias/mis-licencias`, {
          withCredentials: true
        })
      );
      console.log('Licencias obtenidas:', response);
      return response as any[];
    } catch (error: any) {
      console.error('Error al obtener licencias:', error);
    
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        this.router.navigate(['/home'], { replaceUrl: true });
      }
      return [];
    }
  }

  async getLicencia(id: number): Promise<any> {
    console.log('Obteniendo licencia:', id);
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/licencias/${id}`, {
          withCredentials: true
        })
      );
      return response;
    } catch (error: any) {
      console.error('Error al obtener licencia:', error);
      
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        this.router.navigate(['/home'], { replaceUrl: true });
      }
      return null;
    }
  }

  async eliminarLicencia(id: number): Promise<boolean> {
    console.log('Eliminando licencia:', id);
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return false;
    }

    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/licencias/${id}`, {
          withCredentials: true
        })
      );
      console.log('Licencia eliminada');
      return true;
    } catch (error: any) {
      console.error('Error al eliminar licencia:', error);
      
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        this.router.navigate(['/home'], { replaceUrl: true });
      }
      return false;
    }
  }

  async getMisAlertas(): Promise<any[]> {
    console.log('Obteniendo alertas...');
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/alertas/mis-alertas`, {
          withCredentials: true
        })
      );
      return response as any[];
    } catch (error: any) {
      console.error('Error al obtener alertas:', error);
      
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        this.router.navigate(['/home'], { replaceUrl: true });
      }
      return [];
    }
  }

  async crearAlerta(data: any): Promise<any> {
    console.log('Creando alerta...');
    
    if (!await this.ensureBackendAvailable()) {
      return { success: false, message: 'Servidor no disponible' };
    }

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/alertas/crear`, data, {
          withCredentials: true
        })
      );
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Error al crear alerta:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error al crear la alerta' 
      };
    }
  }

  async eliminarAlerta(id: number): Promise<boolean> {
    console.log('Eliminando alerta:', id);
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return false;
    }

    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/alertas/${id}`, {
          withCredentials: true
        })
      );
      return true;
    } catch (error: any) {
      console.error('Error al eliminar alerta:', error);
      return false;
    }
  }

  async marcarAlertaLeida(id: number): Promise<boolean> {
    console.log('Marcando alerta como leída:', id);
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return false;
    }

    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/alertas/${id}/leer`, {}, {
          withCredentials: true
        })
      );
      return true;
    } catch (error: any) {
      console.error('Error al marcar alerta como leída:', error);
      return false;
    }
  }

  async getProductos(): Promise<any[]> {
    console.log('Obteniendo productos...');
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/productos/activos`, {
          withCredentials: true
        })
      );
      return response as any[];
    } catch (error: any) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  async getEstadisticas(): Promise<any> {
    console.log('Obteniendo estadísticas...');
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/estadisticas`, {
          withCredentials: true
        })
      );
      return response;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
}