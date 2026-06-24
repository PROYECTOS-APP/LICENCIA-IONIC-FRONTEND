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
    ingresosUSD: 0,
    ingresosPEN: 0,
    porcentajeLicencias: 0,
    porcentajeClientes: 0,
    porcentajeAlertas: 0,
    porcentajeIngresosUSD: 0,
    porcentajeIngresosPEN: 0
  };

  ultimasLicencias: any[] = [];
  alertasRecientes: any[] = [];

  private USD_TO_PEN = 3.80;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    console.log('HomePage constructor');
  }

  async ngOnInit() {
    console.log('HomePage ngOnInit');
    this.user = this.authService.getCurrentUser();
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 60000);
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    console.log('HomePage ionViewWillEnter');
    await this.cargarDatos();
  }

  // ============ MENU ============
  openMenu() {
    this.menuCtrl.open();
  }

  closeMenu() {
    this.menuCtrl.close();
  }

  async navigateAndClose(page: string) {
    console.log(' Navegando a:', page);
    await this.menuCtrl.close();
    
    setTimeout(() => {
      this.router.navigateByUrl(`/${page}`, { replaceUrl: true })
        .then(success => {
          console.log(`Navegación a ${page}:`, success);
        })
        .catch(err => {
          console.error(`Error navegando a ${page}:`, err);
        });
    }, 200);
  }

  async logoutAndClose() {
    console.log(' Cerrando sesión');
    await this.menuCtrl.close();
    
    setTimeout(() => {
      this.authService.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }, 200);
  }

  // ============ NAVEGACIÓN ============
  navigateTo(page: string) {
    console.log(' Navegando a:', page);
    
    if (!page) {
      console.error(' Página no especificada');
      return;
    }

    this.router.navigateByUrl(`/${page}`, { replaceUrl: true })
      .then(success => {
        if (success) {
          console.log(` Navegación exitosa a ${page}`);
        } else {
          console.error(`Falló la navegación a ${page}`);
        }
      })
      .catch(err => {
        console.error(` Error navegando a ${page}:`, err);
      });
  }

  // ============ DATOS ============
  async cargarDatos() {
    this.isLoading = true;
    console.log(' Cargando datos...');
    
    try {
      const licencias = await this.apiService.getMisLicencias();
      console.log(' Licencias obtenidas:', licencias?.length || 0);
      console.log(' Detalle licencias:', licencias);
      
      const alertas = await this.apiService.getMisAlertas();
      console.log('Alertas obtenidas:', alertas?.length || 0);
      
      this.alertasRecientes = this.formatearAlertas(alertas);
      
      if (licencias && licencias.length > 0) {
        this.calcularEstadisticas(licencias);
        this.ultimasLicencias = this.getUltimasLicencias(licencias, 3);
        this.stats.alertas = this.alertasRecientes.length;
        console.log(' Estadísticas calculadas:', this.stats);
      } else {
        console.log(' No hay licencias, usando valores por defecto');
        this.stats.licencias = 0;
        this.stats.clientes = 0;
        this.stats.ingresosUSD = 0;
        this.stats.ingresosPEN = 0;
        this.ultimasLicencias = [];
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.isLoading = false;
      console.log('Carga de datos completada');
    }
  }

  // ============ UTILIDADES ============
  formatearAlertas(alertas: any[]): any[] {
    if (!alertas || alertas.length === 0) {
      console.log(' No hay alertas para formatear');
      return [];
    }
    
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
    console.log(' Calculando estadísticas...');
    
    const totalLicencias = licencias.length;
    const clientesUnicos = new Set<string>();
    let totalIngresosUSD = 0;
    let totalIngresosPEN = 0;
    
    licencias.forEach(lic => {
      if (lic.cliente) {
        clientesUnicos.add(lic.cliente);
      }
      
      // Sumar según la moneda de la licencia
      if (lic.moneda === 'PEN') {
        // Si es PEN, sumar a ingresosPEN y también convertir a USD para el total
        const precioPEN = lic.precioTotalPEN || 0;
        totalIngresosPEN += precioPEN;
        // También sumar el equivalente en USD para el total general
        totalIngresosUSD += precioPEN / this.USD_TO_PEN;
      } else {
        // Si es USD (o cualquier otro), sumar a ingresosUSD
        const precioUSD = lic.precioTotalUSD || 0;
        totalIngresosUSD += precioUSD;
        // También sumar el equivalente en PEN
        totalIngresosPEN += precioUSD * this.USD_TO_PEN;
      }
      
      console.log(` Licencia: ${lic.producto} - Moneda: ${lic.moneda} - USD: ${lic.precioTotalUSD} - PEN: ${lic.precioTotalPEN}`);
    });
    
    this.stats = {
      licencias: totalLicencias,
      clientes: clientesUnicos.size,
      alertas: this.alertasRecientes.length,
      ingresosUSD: Math.round(totalIngresosUSD),
      ingresosPEN: Math.round(totalIngresosPEN),
      porcentajeLicencias: Math.min(100, Math.round((totalLicencias / 50) * 100)),
      porcentajeClientes: Math.min(100, Math.round((clientesUnicos.size / 50) * 100)),
      porcentajeAlertas: Math.min(100, Math.round((this.alertasRecientes.length / 20) * 100)),
      porcentajeIngresosUSD: Math.min(100, Math.round((totalIngresosUSD / 100000) * 100)),
      porcentajeIngresosPEN: Math.min(100, Math.round((totalIngresosPEN / 380000) * 100))
    };
    
    console.log(' Estadísticas finales:', this.stats);
  }

  getUltimasLicencias(licencias: any[], cantidad: number): any[] {
    console.log('Obteniendo últimas licencias...');
    
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
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.currentTime = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
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

  formatCurrencyUSD(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatCurrencyPEN(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}