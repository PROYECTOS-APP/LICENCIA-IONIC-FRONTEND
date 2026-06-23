import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<ion-router-outlet></ion-router-outlet>`,
  standalone: true,
  imports: [IonRouterOutlet]
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {
    console.log(' AppComponent iniciado');
  }

  ngOnInit() {
    // Verificar si hay sesión activa
    const user = localStorage.getItem('user');
    
    if (user) {
      // Si hay usuario, ir al home
      console.log(' Sesión encontrada, redirigiendo a home');
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      // Si no hay usuario, ir al login
      console.log('❌ No hay sesión, redirigiendo a login');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}