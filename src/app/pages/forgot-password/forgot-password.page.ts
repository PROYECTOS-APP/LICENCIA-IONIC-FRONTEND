import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss']
})
export class ForgotPasswordPage {
  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  resetToken = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async onSendCode() {
    if (this.isLoading) return;
    
    // Validar email
    if (!this.email || this.email.trim() === '') {
      this.errorMessage = 'Por favor ingresa tu correo electrónico';
      return;
    }

    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loading = await this.loadingController.create({
      message: 'Enviando enlace...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const response = await this.authService.forgotPassword(this.email);
      
      await loading.dismiss();

      if (response && response.success) {
        this.successMessage = response.message || '✅ Se ha enviado un enlace a tu correo';
        this.resetToken = response.token;
        
        console.log('✅ Token generado:', this.resetToken);
        console.log('📧 Email:', this.email);
        
        // Mostrar alerta de éxito
        const alert = await this.alertController.create({
          header: '¡Enlace enviado!',
          message: `Se ha enviado un enlace de recuperación a <strong>${this.email}</strong>. Revisa tu correo y sigue las instrucciones.`,
          buttons: [{
            text: 'Ir a restablecer',
            handler: () => {
              // Navegar a reset-password con los datos
              this.router.navigateByUrl('/reset-password', { 
                replaceUrl: true,
                state: { 
                  email: this.email, 
                  token: this.resetToken 
                } 
              }).then(() => {
                console.log('✅ Navegación a reset-password exitosa');
                this.isLoading = false;
              }).catch(err => {
                console.error('❌ Error en navegación:', err);
                this.isLoading = false;
              });
            }
          }],
          cssClass: 'success-alert'
        });
        await alert.present();
        
        // Redirigir después de 3 segundos si no presiona el botón
        setTimeout(() => {
          this.router.navigateByUrl('/reset-password', { 
            replaceUrl: true,
            state: { 
              email: this.email, 
              token: this.resetToken 
            } 
          });
          this.isLoading = false;
        }, 3000);
        
      } else {
        this.errorMessage = response?.message || '❌ Error al enviar el enlace. Verifica que el email esté registrado.';
        this.isLoading = false;
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error en forgot-password:', error);
      this.errorMessage = error?.message || 'Error de conexión. Verifica tu conexión a internet.';
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}