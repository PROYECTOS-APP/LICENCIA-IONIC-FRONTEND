import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) 
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage) 
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./pages/reset-password/reset-password.page').then(m => m.ResetPasswordPage) 
  },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage), 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'crear-licencia', 
    loadComponent: () => import('./pages/licencia-creator/licencia-creator.page').then(m => m.LicenciaCreatorPage), 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'clientes', 
    loadComponent: () => import('./pages/clientes/clientes.page').then(m => m.ClientesPage), 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'alertas', 
    loadComponent: () => import('./pages/alertas/alertas.page').then(m => m.AlertasPage), 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'estadisticas', 
    loadComponent: () => import('./pages/estadisticas/estadisticas.page').then(m => m.EstadisticasPage), 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'resultado', 
    loadComponent: () => import('./pages/resultado/resultado.page').then(m => m.ResultadoPage), 
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: '/login' }
];