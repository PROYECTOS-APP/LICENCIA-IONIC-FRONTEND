// src/app/pages/reset-password/reset-password.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // 👈 Verifica que esta ruta existe

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss']
})
export class ResetPasswordPage implements OnInit {
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  token = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    console.log('ResetPasswordPage constructor');
  }

  ngOnInit() {
    console.log('ResetPasswordPage ngOnInit');
    
    // Obtener los datos de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as any;
    
    console.log('State recibido:', state);
    
    if (state) {
      this.email = state.email || '';
      this.token = state.token || '';
      console.log('Email recibido:', this.email);
      console.log('Token recibido:', this.token);
    }
    
    // Si no hay email o token, redirigir a forgot-password
    if (!this.email || !this.token) {
      console.warn('No hay email o token, redirigiendo a forgot-password');
      setTimeout(() => {
        this.router.navigateByUrl('/forgot-password', { replaceUrl: true });
      }, 1000);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get passwordsMatch(): boolean {
    return this.confirmPassword !== '' && this.newPassword === this.confirmPassword;
  }

  async onReset() {
    console.log('Intentando restablecer contraseña...');
    
    if (this.isLoading) return;
    
    // Validar que el email existe
    if (!this.email || this.email.trim() === '') {
      this.errorMessage = 'No se encontró el correo. Vuelve a solicitar el enlace.';
      console.warn('Email vacío');
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      console.warn('Contraseña muy corta');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      console.warn('Contraseñas no coinciden');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loading = await this.loadingController.create({
      message: 'Restableciendo contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      console.log('Enviando petición al backend...');
      console.log('  - Token:', this.token);
      console.log('  - NewPassword:', this.newPassword);
      
      const response = await this.authService.resetPassword(this.token, this.newPassword);
      
      console.log('Respuesta del backend:', response);
      
      await loading.dismiss();
      
      if (response && response.success) {
        this.successMessage = response.message || 'Contraseña actualizada correctamente';
        console.log('Contraseña actualizada exitosamente');
        
        // Mostrar alerta de éxito
        const alert = await this.alertController.create({
          header: '¡Contraseña actualizada!',
          message: 'Tu contraseña ha sido restablecida exitosamente. Serás redirigido al login.',
          buttons: [{
            text: 'OK',
            handler: () => {
              console.log('Usuario presionó OK, redirigiendo a login');
              this.router.navigateByUrl('/login', { replaceUrl: true });
            }
          }],
          cssClass: 'success-alert'
        });
        await alert.present();
        
        // También redirigir después de 3 segundos por si no presiona OK
        setTimeout(() => {
          console.log('Timeout 3s, redirigiendo a login');
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }, 3000);
        
      } else {
        this.errorMessage = response?.message || 'Error al restablecer contraseña';
        console.error('Error en respuesta:', response);
        this.isLoading = false;
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error en reset-password:', error);
      this.errorMessage = error?.message || 'Error de conexión. Verifica tu conexión a internet.';
      this.isLoading = false;
    }
  }

  goBack() {
    console.log(' Volviendo al login');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}