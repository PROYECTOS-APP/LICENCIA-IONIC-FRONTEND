import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss']
})
export class EstadisticasPage implements OnInit {
  isLoading = true;
  stats = {
    totalLicencias: 0,
    activas: 0,
    vencidas: 0,
    porVencer: 0,
    ingresosMensuales: 0,
    ingresosAnuales: 0,
    clientesActivos: 0,
    nuevosClientes: 0,
    totalIngresos: 0,
    // Nuevos campos para USD y PEN
    totalIngresosUSD: 0,
    totalIngresosPEN: 0,
    ingresosMensualesUSD: 0,
    ingresosMensualesPEN: 0,
    ingresosAnualesUSD: 0,
    ingresosAnualesPEN: 0
  };

  private USD_TO_PEN = 3.80;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarEstadisticas();
  }

  async ionViewWillEnter() {
    await this.cargarEstadisticas();
  }

  goToHome() {
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  async refreshData() {
    await this.cargarEstadisticas();
  }

  getPorcentaje(valor: number, total: number): number {
    if (total === 0) return 0;
    return (valor / total) * 100;
  }

  verDetalles(tipo: string) {
    switch(tipo) {
      case 'activas':
      case 'vencidas':
      case 'porVencer':
        this.router.navigateByUrl('/clientes', { replaceUrl: true });
        break;
    }
  }

  async cargarEstadisticas() {
    this.isLoading = true;
    try {
      const licencias = await this.apiService.getMisLicencias();
      
      if (licencias && licencias.length > 0) {
        this.calcularEstadisticas(licencias);
      } else {
        this.usarDatosEjemplo();
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      this.usarDatosEjemplo();
    } finally {
      this.isLoading = false;
    }
  }

  calcularEstadisticas(licencias: any[]) {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + 30);

    let activas = 0;
    let vencidas = 0;
    let porVencer = 0;
    let totalIngresosUSD = 0;
    let totalIngresosPEN = 0;
    const clientesSet = new Set<string>();
    const ingresosPorMesUSD: { [key: string]: number } = {};
    const ingresosPorMesPEN: { [key: string]: number } = {};

    licencias.forEach(lic => {
      // Calcular ingresos en USD
      const precioUSD = lic.precioTotalUSD || 0;
      totalIngresosUSD += precioUSD;
      
      // Calcular ingresos en PEN
      const precioPEN = lic.precioTotalPEN || (precioUSD * this.USD_TO_PEN);
      totalIngresosPEN += precioPEN;
      
      if (lic.cliente) {
        clientesSet.add(lic.cliente);
      }

      if (lic.fechaCreacion) {
        const fecha = new Date(lic.fechaCreacion);
        const mesKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
        ingresosPorMesUSD[mesKey] = (ingresosPorMesUSD[mesKey] || 0) + precioUSD;
        ingresosPorMesPEN[mesKey] = (ingresosPorMesPEN[mesKey] || 0) + precioPEN;
      }

      const fechaVenc = new Date(lic.fechaVencimiento);
      if (fechaVenc < hoy) {
        vencidas++;
      } else if (fechaVenc <= fechaLimite) {
        porVencer++;
        activas++;
      } else {
        activas++;
      }
    });

    const hoyObj = new Date();
    const mesActual = `${hoyObj.getFullYear()}-${hoyObj.getMonth() + 1}`;
    const ingresosMensualesUSD = ingresosPorMesUSD[mesActual] || 0;
    const ingresosMensualesPEN = ingresosPorMesPEN[mesActual] || 0;

    const añoActual = hoyObj.getFullYear();
    let ingresosAnualesUSD = 0;
    let ingresosAnualesPEN = 0;
    Object.keys(ingresosPorMesUSD).forEach(key => {
      const año = parseInt(key.split('-')[0]);
      if (año === añoActual) {
        ingresosAnualesUSD += ingresosPorMesUSD[key];
        ingresosAnualesPEN += ingresosPorMesPEN[key];
      }
    });

    this.stats = {
      totalLicencias: licencias.length,
      activas: activas,
      vencidas: vencidas,
      porVencer: porVencer,
      ingresosMensuales: Math.round(ingresosMensualesUSD),
      ingresosAnuales: Math.round(ingresosAnualesUSD),
      clientesActivos: clientesSet.size,
      nuevosClientes: 0,
      totalIngresos: Math.round(totalIngresosUSD),
      totalIngresosUSD: Math.round(totalIngresosUSD),
      totalIngresosPEN: Math.round(totalIngresosPEN),
      ingresosMensualesUSD: Math.round(ingresosMensualesUSD),
      ingresosMensualesPEN: Math.round(ingresosMensualesPEN),
      ingresosAnualesUSD: Math.round(ingresosAnualesUSD),
      ingresosAnualesPEN: Math.round(ingresosAnualesPEN)
    };
  }

  usarDatosEjemplo() {
    this.stats = {
      totalLicencias: 24,
      activas: 18,
      vencidas: 3,
      porVencer: 3,
      ingresosMensuales: 12500,
      ingresosAnuales: 150000,
      clientesActivos: 12,
      nuevosClientes: 5,
      totalIngresos: 45000,
      totalIngresosUSD: 45000,
      totalIngresosPEN: 171000,
      ingresosMensualesUSD: 12500,
      ingresosMensualesPEN: 47500,
      ingresosAnualesUSD: 150000,
      ingresosAnualesPEN: 570000
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatCurrencyPEN(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}