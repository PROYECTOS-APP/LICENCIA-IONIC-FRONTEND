import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  acceptTerms = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get passwordStrength(): string {
    if (!this.password) return '';
    if (this.password.length < 6) return 'weak';
    if (this.password.length < 8) return 'medium';
    return 'strong';
  }

  get strengthText(): string {
    if (!this.password) return '';
    if (this.password.length < 6) return 'Débil';
    if (this.password.length < 8) return 'Media';
    return 'Fuerte';
  }

  get passwordsMatch(): boolean {
    return this.confirmPassword !== '' && this.password === this.confirmPassword;
  }

  async onRegister() {
    if (this.isLoading) return;
    
    if (!this.nombre || !this.email || !this.password) {
      this.errorMessage = 'Completa todos los campos';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Correo inválido';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const result = await this.authService.register(this.nombre, this.email, this.password);
      
      await loading.dismiss();

      if (result && result.success) {
        console.log('✅ Usuario registrado exitosamente');
        // Usar navigateByUrl con replaceUrl
        this.router.navigateByUrl('/home', { replaceUrl: true })
          .then(() => {
            console.log('✅ Navegación a home exitosa');
          })
          .catch(err => {
            console.error('❌ Error en navegación:', err);
          });
      } else {
        this.errorMessage = result?.message || 'El email ya está registrado';
        this.isLoading = false;
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error en registro:', error);
      this.errorMessage = error?.message || 'Error de conexión';
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}