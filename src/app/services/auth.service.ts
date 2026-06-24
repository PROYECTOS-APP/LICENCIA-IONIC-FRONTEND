// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackendStatusService } from './backend-status.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private backendStatus: BackendStatusService,
    private router: Router
  ) {
    console.log('AuthService inicializado');
    console.log('API URL:', this.apiUrl);
  }

  // ============================================
  // REGISTER - AGREGAR ESTE MÉTODO
  // ============================================
  async register(nombre: string, email: string, password: string): Promise<any> {
    console.log('AuthService.register llamado');
    console.log('  - Nombre:', nombre);
    console.log('  - Email:', email);
    console.log('  - Password:', password ? '***' : 'vacío');
    
    if (!this.backendStatus.isBackendAvailable()) {
      console.warn('Backend no disponible');
      this.router.navigate(['/home'], { replaceUrl: true });
      return { 
        success: false, 
        message: 'Servidor no disponible. Modo offline.' 
      };
    }

    try {
      const url = `${this.apiUrl}/auth/registro`;
      console.log('URL:', url);
      
      const response = await firstValueFrom(
        this.http.post<any>(url, 
          { nombre, email, password },
          { withCredentials: true }
        )
      );
      
      console.log('Respuesta registro:', response);
      
      if (response && response.success) {
        const userData = { 
          id: response.id,
          nombre: response.nombre, 
          email: response.email,
          avatar: response.avatar || 'assets/icon/avatar-default.png'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Registro exitoso, sesión guardada');
        return { success: true, data: userData };
      }
      return { 
        success: false, 
        message: response?.mensaje || 'Error en el registro' 
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        this.router.navigate(['/home'], { replaceUrl: true });
        return { 
          success: false, 
          message: 'Servidor no disponible. Intenta más tarde.' 
        };
      }
      
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  async login(email: string, password: string): Promise<any> {
    console.log('Intentando login...');
    
    if (!this.backendStatus.isBackendAvailable()) {
      console.log('Login: Backend no disponible');
      this.router.navigate(['/home'], { replaceUrl: true });
      return { 
        success: false, 
        message: 'Servidor no disponible. Modo offline.' 
      };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/login`, 
          { email, password },
          { withCredentials: true }
        )
      );
      
      if (response && response.success) {
        const userData = { 
          id: response.id,
          nombre: response.nombre, 
          email: response.email,
          avatar: response.avatar || 'assets/icon/avatar-default.png'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Login exitoso');
        return { success: true, data: userData };
      }
      return { success: false, message: response?.mensaje || 'Credenciales inválidas' };
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        this.router.navigate(['/home'], { replaceUrl: true });
        return { 
          success: false, 
          message: 'Servidor no disponible.' 
        };
      }
      
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  // ============================================
  // FORGOT PASSWORD
  // ============================================
  async forgotPassword(email: string): Promise<any> {
    console.log('AuthService.forgotPassword llamado:', email);
    
    if (!this.backendStatus.isBackendAvailable()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return { 
        success: false, 
        message: 'Servidor no disponible. Modo offline.' 
      };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, 
          { email },
          { withCredentials: true }
        )
      );
      
      console.log('Respuesta forgot-password:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          message: response.message || 'Se ha enviado el enlace a tu correo',
          token: response.token
        };
      }
      return { 
        success: false, 
        message: response?.mensaje || 'Error al enviar el correo' 
      };
    } catch (error: any) {
      console.error('Error en forgot-password:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  // ============================================
  // RESET PASSWORD
  // ============================================
  async resetPassword(token: string, newPassword: string): Promise<any> {
    console.log(' AuthService.resetPassword llamado');
    console.log('  - Token:', token);
    console.log('  - NewPassword:', newPassword ? '***' : 'vacío');
    
    if (!this.backendStatus.isBackendAvailable()) {
      console.warn('Backend no disponible');
      this.router.navigate(['/home'], { replaceUrl: true });
      return { 
        success: false, 
        message: 'Servidor no disponible. Modo offline.' 
      };
    }

    try {
      const url = `${this.apiUrl}/auth/reset-password`;
      console.log(' URL:', url);
      
      const response = await firstValueFrom(
        this.http.post<any>(url, 
          { token, newPassword },
          { withCredentials: true }
        )
      );
      
      console.log('Respuesta reset-password:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          message: response.message || 'Contraseña actualizada correctamente'
        };
      }
      return { 
        success: false, 
        message: response?.mensaje || 'Error al restablecer la contraseña' 
      };
    } catch (error: any) {
      console.error('Error en reset-password:', error);
      
      if (error.status === 0 || error.status === 504) {
        this.backendStatus.forceCheck();
        return { 
          success: false, 
          message: 'Servidor no disponible. Intenta más tarde.' 
        };
      }
      
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  // ============================================
  // LOGOUT
  // ============================================
  async logout(): Promise<void> {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/logout`, {}, { 
          withCredentials: true 
        })
      );
      
      console.log('Logout exitoso');
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Error en logout:', error);
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  async getCurrentUserFromServer(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/auth/me`, {
          withCredentials: true
        })
      );
      
      if (response && response.success) {
        const userData = { 
          id: response.id,
          nombre: response.nombre, 
          email: response.email,
          avatar: response.avatar || 'assets/icon/avatar-default.png'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario del servidor:', error);
      return null;
    }
  }

  async checkSession(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/auth/me`, {
          withCredentials: true
        })
      );
      return response;
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      return { authenticated: false };
    }
  }

  async uploadAvatar(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/avatar/upload`, formData, {
          withCredentials: true
        })
      );

      if (response.success) {
        const user = this.getCurrentUser();
        if (user) {
          user.avatar = response.avatar;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return response;
      }
      return { success: false, message: response?.message || 'Error al subir avatar' };
    } catch (error: any) {
      console.error('Error al subir avatar:', error);
      return { 
        success: false, 
        message: error.error?.message || 'Error de conexión' 
      };
    }
  }

  async deleteAvatar(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.delete<any>(`${this.apiUrl}/avatar/delete`, {
          withCredentials: true
        })
      );

      if (response.success) {
        const user = this.getCurrentUser();
        if (user) {
          user.avatar = response.avatar;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return response;
      }
      return { success: false, message: response?.message || 'Error al eliminar avatar' };
    } catch (error: any) {
      console.error('Error al eliminar avatar:', error);
      return { 
        success: false, 
        message: error.error?.message || 'Error de conexión' 
      };
    }
  }
}