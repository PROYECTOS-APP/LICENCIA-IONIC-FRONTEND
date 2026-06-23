import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.isLoading) return;
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Completa todos los campos';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Correo inválido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const result = await this.authService.login(this.email, this.password);
      
      await loading.dismiss();

      if (result && result.success) {
        console.log(' Login exitoso');
        this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        this.errorMessage = result?.message || 'Credenciales incorrectas';
        this.isLoading = false;
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error(' Error en login:', error);
      this.errorMessage = error?.message || 'Error de conexión';
      this.isLoading = false;
    }
  }

  goToRegister() {
    this.router.navigateByUrl('/register', { replaceUrl: true });
  }

  goToForgotPassword() {
    this.router.navigateByUrl('/forgot-password', { replaceUrl: true });
  }
}