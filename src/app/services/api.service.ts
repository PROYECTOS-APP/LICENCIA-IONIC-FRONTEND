import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;  // ← ✅ CORREGIDO

  constructor(private http: HttpClient) {}

  // ============ LICENCIAS ============
  async crearLicencia(data: any): Promise<any> {
    try {
      console.log('📤 Enviando licencia al backend:', data);
      
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/licencias/crear`, data, {
          withCredentials: true, 
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      
      console.log('✅ Respuesta del backend:', response);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ Error detallado:', error);
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
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/licencias/mis-licencias`, {
          withCredentials: true
        })
      );
      return response as any[];
    } catch (error) {
      console.error('❌ Error al obtener licencias:', error);
      return [];
    }
  }

  async getLicencia(id: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/licencias/${id}`, {
          withCredentials: true
        })
      );
      return response;
    } catch (error) {
      console.error('❌ Error al obtener licencia:', error);
      return null;
    }
  }

  async eliminarLicencia(id: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/licencias/${id}`, {
          withCredentials: true
        })
      );
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar licencia:', error);
      return false;
    }
  }

  // ============ ALERTAS ============
  async getMisAlertas(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/alertas/mis-alertas`, {
          withCredentials: true
        })
      );
      return response as any[];
    } catch (error) {
      console.error('❌ Error al obtener alertas:', error);
      return [];
    }
  }

  async crearAlerta(data: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/alertas/crear`, data, {
          withCredentials: true
        })
      );
      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ Error al crear alerta:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error al crear la alerta' 
      };
    }
  }

  async eliminarAlerta(id: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/alertas/${id}`, {
          withCredentials: true
        })
      );
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar alerta:', error);
      return false;
    }
  }

  async marcarAlertaLeida(id: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/alertas/${id}/leer`, {}, {
          withCredentials: true
        })
      );
      return true;
    } catch (error) {
      console.error('❌ Error al marcar alerta como leída:', error);
      return false;
    }
  }

  // ============ PRODUCTOS ============
  async getProductos(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/productos/activos`, {
          withCredentials: true
        })
      );
      return response as any[];
    } catch (error) {
      console.error('❌ Error al obtener productos:', error);
      return [];
    }
  }

  // ============ ESTADÍSTICAS ============
  async getEstadisticas(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/estadisticas`, {
          withCredentials: true
        })
      );
      return response;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return null;
    }
  }
}