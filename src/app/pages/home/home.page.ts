import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  user: any = null;
  currentDate: string = '';
  currentTime: string = '';
  isLoading = true;
  
  stats = {
    licencias: 0,
    clientes: 0,
    alertas: 0,
    ingresos: 0,
    porcentajeLicencias: 0,
    porcentajeClientes: 0,
    porcentajeAlertas: 0,
    porcentajeIngresos: 0
  };

  ultimasLicencias: any[] = [];
  alertasRecientes: any[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    console.log('🏠 HomePage constructor');
  }

  async ngOnInit() {
    console.log('🔄 HomePage ngOnInit');
    this.user = this.authService.getCurrentUser();
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 60000);
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    console.log('📱 HomePage ionViewWillEnter');
    await this.cargarDatos();
  }

  // ============ MENÚ ============
  openMenu() {
    this.menuCtrl.open();
  }

  closeMenu() {
    this.menuCtrl.close();
  }

  async navigateAndClose(page: string) {
    console.log('🚀 Navegando a:', page);
    await this.menuCtrl.close();
    
    // Usar setTimeout para asegurar que el menú se cierre
    setTimeout(() => {
      this.router.navigateByUrl(`/${page}`, { replaceUrl: true })
        .then(success => {
          console.log(`✅ Navegación a ${page}:`, success);
        })
        .catch(err => {
          console.error(`❌ Error navegando a ${page}:`, err);
        });
    }, 200);
  }

  async logoutAndClose() {
    console.log('🚪 Cerrando sesión');
    await this.menuCtrl.close();
    
    setTimeout(() => {
      this.authService.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }, 200);
  }

  // ============ NAVEGACIÓN ============
  navigateTo(page: string) {
    console.log('🎯 Navegando a:', page);
    
    if (!page) {
      console.error('❌ Página no especificada');
      return;
    }

    // Navegar con replaceUrl para evitar historial
    this.router.navigateByUrl(`/${page}`, { replaceUrl: true })
      .then(success => {
        if (success) {
          console.log(`✅ Navegación exitosa a ${page}`);
        } else {
          console.error(`❌ Falló la navegación a ${page}`);
        }
      })
      .catch(err => {
        console.error(`❌ Error navegando a ${page}:`, err);
      });
  }

  // ============ DATOS ============
  async cargarDatos() {
    this.isLoading = true;
    try {
      const licencias = await this.apiService.getMisLicencias();
      const alertas = await this.apiService.getMisAlertas();
      
      this.alertasRecientes = this.formatearAlertas(alertas);
      
      if (licencias && licencias.length > 0) {
        this.calcularEstadisticas(licencias);
        this.ultimasLicencias = this.getUltimasLicencias(licencias, 3);
        this.stats.alertas = this.alertasRecientes.length;
      } else {
        this.stats.licencias = 0;
        this.stats.clientes = 0;
        this.stats.ingresos = 0;
        this.ultimasLicencias = [];
      }
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // ============ UTILIDADES ============
  formatearAlertas(alertas: any[]): any[] {
    if (!alertas || alertas.length === 0) return [];
    
    return alertas.map(alerta => {
      let tipo = 'info';
      let icono = 'information-circle-outline';
      
      switch (alerta.tipo) {
        case 'Éxito':
          tipo = 'success';
          icono = 'checkmark-circle-outline';
          break;
        case 'Advertencia':
          tipo = 'warning';
          icono = 'warning-outline';
          break;
        case 'Error':
          tipo = 'danger';
          icono = 'close-circle-outline';
          break;
        default:
          tipo = 'info';
          icono = 'information-circle-outline';
      }
      
      return {
        tipo: tipo,
        icono: icono,
        mensaje: alerta.mensaje,
        prioridad: alerta.prioridad,
        titulo: alerta.titulo,
        fecha: this.formatDateShort(alerta.fechaCreacion)
      };
    });
  }

  calcularEstadisticas(licencias: any[]) {
    const totalLicencias = licencias.length;
    const clientesUnicos = new Set<string>();
    licencias.forEach(lic => {
      if (lic.cliente) clientesUnicos.add(lic.cliente);
    });
    const totalIngresos = licencias.reduce((sum, lic) => sum + (lic.precioTotalUSD || 0), 0);
    
    this.stats = {
      licencias: totalLicencias,
      clientes: clientesUnicos.size,
      alertas: this.alertasRecientes.length,
      ingresos: Math.round(totalIngresos),
      porcentajeLicencias: Math.min(100, Math.round((totalLicencias / 50) * 100)),
      porcentajeClientes: Math.min(100, Math.round((clientesUnicos.size / 50) * 100)),
      porcentajeAlertas: Math.min(100, Math.round((this.alertasRecientes.length / 20) * 100)),
      porcentajeIngresos: Math.min(100, Math.round((totalIngresos / 100000) * 100))
    };
  }

  getUltimasLicencias(licencias: any[], cantidad: number): any[] {
    const ordenadas = [...licencias].sort((a, b) => 
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
    return ordenadas.slice(0, cantidad).map(lic => ({
      codigo: lic.codigoLicencia,
      producto: lic.producto,
      cliente: lic.cliente,
      fecha: this.formatDateShort(lic.fechaCreacion)
    }));
  }

  formatDateShort(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('es-ES', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    this.currentTime = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', minute: '2-digit' 
    });
  }

  getSaludo(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}