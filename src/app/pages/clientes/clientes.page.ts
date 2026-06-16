import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PriceUtils } from '../../shared/utils/price.utils';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss']
})
export class ClientesPage implements OnInit {
  licencias: any[] = [];
  isLoading = true;
  clientesUnicos = 0;
  PriceUtils = PriceUtils;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarLicencias();
  }

  async ionViewWillEnter() {
    await this.cargarLicencias();
  }

goToHome() {
  this.router.navigateByUrl('/home', { replaceUrl: true });
}

goToCrearLicencia() {
  this.router.navigateByUrl('/crear-licencia', { replaceUrl: true });
}

  async cargarLicencias() {
    this.isLoading = true;
    try {
      this.licencias = await this.apiService.getMisLicencias();
      // Calcular clientes únicos
      const clientesSet = new Set(this.licencias.map(l => l.cliente).filter(c => c));
      this.clientesUnicos = clientesSet.size;
      console.log(' Licencias cargadas:', this.licencias);
    } catch (error) {
      console.error('❌ Error al cargar licencias:', error);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatPrecio(licencia: any): string {
    if (licencia.moneda === 'PEN') {
      return `S/ ${(licencia.precioTotalPEN || licencia.precioTotalUSD * 3.80).toFixed(2)} PEN`;
    }
    return `$${licencia.precioTotalUSD.toFixed(2)} USD`;
  }

  async copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      console.log(' Código copiado:', code);
    } catch (error) {
      console.error('❌ Error al copiar:', error);
    }
  }

  shareLicencia(licencia: any) {
    const mensaje = `LICENCIA: ${licencia.codigoLicencia}\nProducto: ${licencia.producto}\nCliente: ${licencia.cliente}\nVence: ${this.formatDate(licencia.fechaVencimiento)}`;
    if (navigator.share) {
      navigator.share({ title: 'Licencia', text: mensaje });
    } else {
      navigator.clipboard.writeText(mensaje);
    }
  }
}