import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-licencia-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './licencia-creator.page.html',
  styleUrls: ['./licencia-creator.page.scss']
})
export class LicenciaCreatorPage implements OnInit {
  
  productos: any[] = [];
  productoSeleccionado: any = null;
  tipoLicencia = 'Anual';
  fechaVencimiento: string = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  cantidadLicencias = 1;
  cliente = '';
  empresa = '';
  correo = '';
  notas = '';
  isLoading = false;
  moneda = 'USD';

  tiposLicencia = ['Mensual', 'Trimestral', 'Semestral', 'Anual', 'Perpetua'];
  fechaMinima: string = new Date().toISOString();
  fechaMaxima: string = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString();

  private USD_TO_PEN = 3.80;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarProductos();
  }

  async ionViewWillEnter() {
    await this.cargarProductos();
  }

  goToHome() {
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  cambiarMoneda(moneda: string) {
    this.moneda = moneda;
    console.log('Moneda cambiada a:', moneda);
  }

  aumentarCantidad() {
    if (this.cantidadLicencias < 100) {
      this.cantidadLicencias++;
    }
  }

  disminuirCantidad() {
    if (this.cantidadLicencias > 1) {
      this.cantidadLicencias--;
    }
  }

  async cargarProductos() {
    this.isLoading = true;
    try {
      this.productos = await this.apiService.getProductos();
      console.log('Productos cargados:', this.productos.length);
    } catch (error) {
      console.error(' Error al cargar productos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get precioUnitario(): number {
    if (!this.productoSeleccionado) return 0;
    let precio = this.productoSeleccionado.precioBaseUsd;
    if (this.moneda === 'PEN') {
      return precio * this.USD_TO_PEN;
    }
    return precio;
  }

  get precioUnitarioFormateado(): string {
    if (this.moneda === 'USD') {
      return `$${this.precioUnitario.toFixed(2)} USD`;
    }
    return `S/ ${this.precioUnitario.toFixed(2)} PEN`;
  }

  get descuentoPorcentaje(): number {
    const descuentos: any = {
      'Mensual': 0,
      'Trimestral': 5,
      'Semestral': 10,
      'Anual': 20,
      'Perpetua': 30
    };
    return descuentos[this.tipoLicencia] || 0;
  }

  get precioTotal(): number {
    if (!this.productoSeleccionado) return 0;
    
    let precio = this.productoSeleccionado.precioBaseUsd * this.cantidadLicencias;
    
    const descuentos: any = {
      'Mensual': 0,
      'Trimestral': 0.05,
      'Semestral': 0.10,
      'Anual': 0.20,
      'Perpetua': 0.30
    };
    precio = precio - (precio * (descuentos[this.tipoLicencia] || 0));
    
    if (this.moneda === 'PEN') {
      return precio * this.USD_TO_PEN;
    }
    return precio;
  }

  get descuentoValor(): number {
    if (!this.productoSeleccionado) return 0;
    const descuentos: any = {
      'Mensual': 0,
      'Trimestral': 0.05,
      'Semestral': 0.10,
      'Anual': 0.20,
      'Perpetua': 0.30
    };
    const descuento = descuentos[this.tipoLicencia] || 0;
    const valorDescuento = this.productoSeleccionado.precioBaseUsd * this.cantidadLicencias * descuento;
    
    if (this.moneda === 'PEN') {
      return valorDescuento * this.USD_TO_PEN;
    }
    return valorDescuento;
  }

  get descuentoFormateado(): string {
    if (this.moneda === 'USD') {
      return `$${this.descuentoValor.toFixed(2)} USD (${this.descuentoPorcentaje}%)`;
    }
    return `S/ ${this.descuentoValor.toFixed(2)} PEN (${this.descuentoPorcentaje}%)`;
  }

  get precioFormateado(): string {
    if (this.moneda === 'USD') {
      return `$${this.precioTotal.toFixed(2)} USD`;
    }
    return `S/ ${this.precioTotal.toFixed(2)} PEN`;
  }

  selectProducto(producto: any) {
    this.productoSeleccionado = producto;
    console.log('Producto seleccionado:', producto.nombre);
  }

  async generarLicencia() {
    console.log('Generando licencia...');
    
    if (!this.productoSeleccionado) {
      await this.showError('Selecciona un producto');
      return;
    }
    if (!this.fechaVencimiento) {
      await this.showError('Selecciona una fecha de vencimiento');
      return;
    }
    if (!this.cliente) {
      await this.showError('Ingresa el nombre del cliente');
      return;
    }
    if (!this.correo || !this.correo.includes('@')) {
      await this.showError('Ingresa un correo válido');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Generando licencia...',
      spinner: 'crescent'
    });
    await loading.present();

    const fecha = new Date(this.fechaVencimiento);
    const fechaFormateada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

    const licenciaData = {
      productoId: this.productoSeleccionado.id,
      tipo: this.tipoLicencia,
      fechaVencimiento: fechaFormateada,
      cantidadLicencias: this.cantidadLicencias,
      moneda: this.moneda,
      cliente: this.cliente,
      empresa: this.empresa || "",
      correo: this.correo,
      notas: this.notas || ""
    };

    console.log('Enviando al backend:', licenciaData);

    try {
      const result = await this.apiService.crearLicencia(licenciaData);
      console.log('Respuesta del backend:', result);
      
      await loading.dismiss();
      
      if (result.success) {
        console.log('Licencia creada, navegando a resultado');
        // Navegar a resultado con los datos
        this.router.navigateByUrl('/resultado', { 
          replaceUrl: true,
          state: { licenciaData: result.data.licencia } 
        }).then(() => {
          console.log('Navegación a resultado exitosa');
        }).catch(err => {
          console.error(' Error navegando a resultado:', err);
        });
      } else {
        await this.showError(result.message || 'Error al generar licencia');
      }
    } catch (error) {
      await loading.dismiss();
      console.error('Error:', error);
      await this.showError('Error de conexión con el servidor');
    }
  }

  async showError(msg: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }
}