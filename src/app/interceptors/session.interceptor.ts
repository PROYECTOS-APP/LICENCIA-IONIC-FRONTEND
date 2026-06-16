import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Si hay token, clonar la request y agregar el header
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      return next.handle(cloned);
    }
    
    // Si no hay token, pasar la request sin modificar
    return next.handle(req);
  }
}