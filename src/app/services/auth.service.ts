import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ============================================
  // AUTENTICACIÓN
  // ============================================

  async login(email: string, password: string): Promise<any> {
    try {
      console.log('🔐 Intentando login:', email);
      
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/login`, 
          { email, password },
          { withCredentials: true }
        )
      );
      
      console.log('✅ Respuesta login:', response);
      
      if (response && response.success) {
        const userData = { 
          id: response.id,
          nombre: response.nombre, 
          email: response.email,
          avatar: response.avatar || 'assets/icon/avatar-default.png'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Login exitoso, sesión guardada');
        return { success: true, data: userData };
      }
      return { success: false, message: response?.mensaje || 'Credenciales inválidas' };
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  async register(nombre: string, email: string, password: string): Promise<any> {
    try {
      console.log('📝 Intentando registrar:', email);
      
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/registro`, 
          { nombre, email, password },
          { withCredentials: true }
        )
      );
      
      console.log('✅ Respuesta registro:', response);
      
      if (response && response.success) {
        const userData = { 
          id: response.id,
          nombre: response.nombre, 
          email: response.email,
          avatar: response.avatar || 'assets/icon/avatar-default.png'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Registro exitoso');
        return { success: true, data: userData };
      }
      return { success: false, message: response?.mensaje || 'Error en el registro' };
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  // ============================================
  // RECUPERAR CONTRASEÑA
  // ============================================

  async forgotPassword(email: string): Promise<any> {
    try {
      console.log('📧 Enviando solicitud de recuperación para:', email);
      
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, 
          { email },
          { withCredentials: true }
        )
      );
      
      console.log('✅ Respuesta forgot-password:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          message: response.message || 'Se ha enviado el enlace a tu correo',
          token: response.token
        };
      }
      return { 
        success: false, 
        message: response?.mensaje || 'Error al enviar el correo. Verifica que el email esté registrado.' 
      };
    } catch (error: any) {
      console.error('❌ Error en forgot-password:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {
      console.log('🔐 Restableciendo contraseña con token:', token);
      
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/reset-password`, 
          { token, newPassword },
          { withCredentials: true }
        )
      );
      
      console.log('✅ Respuesta reset-password:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          message: response.message || 'Contraseña actualizada correctamente'
        };
      }
      return { 
        success: false, 
        message: response?.mensaje || 'Error al restablecer la contraseña. El enlace puede haber expirado.' 
      };
    } catch (error: any) {
      console.error('❌ Error en reset-password:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión. Verifica tu conexión a internet.' 
      };
    }
  }

  // ============================================
  // AVATAR
  // ============================================

  async uploadAvatar(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('📤 Subiendo avatar...');

      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/avatar/upload`, formData, {
          withCredentials: true
        })
      );

      console.log('✅ Respuesta upload-avatar:', response);

      if (response.success) {
        // Actualizar localStorage
        const user = this.getCurrentUser();
        if (user) {
          user.avatar = response.avatar;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return response;
      }
      return { success: false, message: response?.message || 'Error al subir avatar' };
    } catch (error: any) {
      console.error('❌ Error al subir avatar:', error);
      return { 
        success: false, 
        message: error.error?.message || 'Error de conexión' 
      };
    }
  }

  async deleteAvatar(): Promise<any> {
    try {
      console.log('🗑️ Eliminando avatar...');

      const response = await firstValueFrom(
        this.http.delete<any>(`${this.apiUrl}/avatar/delete`, {
          withCredentials: true
        })
      );

      console.log('✅ Respuesta delete-avatar:', response);

      if (response.success) {
        // Actualizar localStorage
        const user = this.getCurrentUser();
        if (user) {
          user.avatar = response.avatar;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return response;
      }
      return { success: false, message: response?.message || 'Error al eliminar avatar' };
    } catch (error: any) {
      console.error('❌ Error al eliminar avatar:', error);
      return { 
        success: false, 
        message: error.error?.message || 'Error de conexión' 
      };
    }
  }

  // ============================================
  // SESIÓN
  // ============================================

  async verificarSesion(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/auth/me`, {
          withCredentials: true
        })
      );
      return response && response.success;
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      return false;
    }
  }

  async checkSession(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/auth/check-session`, {
          withCredentials: true
        })
      );
      return response;
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      return { authenticated: false };
    }
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
      console.error('❌ Error al obtener usuario del servidor:', error);
      return null;
    }
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/logout`, {}, { 
          withCredentials: true 
        })
      );
      
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  // ============================================
  // ACTUALIZAR DATOS DEL USUARIO
  // ============================================

  updateUserData(userData: any): void {
    if (userData) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  }

  updateAvatar(avatarUrl: string): void {
    const user = this.getCurrentUser();
    if (user) {
      user.avatar = avatarUrl;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // ============================================
  // VALIDACIÓN DE TOKEN Y EMAIL
  // ============================================

  async validateResetToken(token: string): Promise<any> {
    try {
      console.log('🔍 Validando token:', token);
      
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/validate-token`, 
          { token },
          { withCredentials: true }
        )
      );
      
      console.log('✅ Respuesta validate-token:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          email: response.email,
          message: response.message || 'Token válido'
        };
      }
      return { 
        success: false, 
        message: response?.mensaje || 'Token inválido o expirado' 
      };
    } catch (error: any) {
      console.error('❌ Error en validate-token:', error);
      return { 
        success: false, 
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }

  async checkEmailExists(email: string): Promise<any> {
    try {
      console.log('🔍 Verificando email:', email);
      
      const response = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/auth/check-email`, 
          { email },
          { withCredentials: true }
        )
      );
      
      console.log('✅ Respuesta check-email:', response);
      
      if (response && response.success) {
        return { 
          success: true, 
          exists: response.exists,
          message: response.message || 'Email verificado'
        };
      }
      return { 
        success: false, 
        exists: false,
        message: response?.mensaje || 'Email no encontrado' 
      };
    } catch (error: any) {
      console.error('❌ Error en check-email:', error);
      return { 
        success: false, 
        exists: false,
        message: error.error?.mensaje || 'Error de conexión' 
      };
    }
  }
}