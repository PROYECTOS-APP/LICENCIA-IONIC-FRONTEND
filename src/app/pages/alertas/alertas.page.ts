import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss']
})
export class AlertasPage implements OnInit {
  titulo = '';
  mensaje = '';
  tipoAlerta = 'Info';
  prioridad = 'Media';
  fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  alertas: any[] = [];
  isLoading = false;
  fechaMinima: string = new Date().toISOString();

  tipos = ['Info', 'Éxito', 'Advertencia', 'Error'];
  prioridades = ['Baja', 'Media', 'Alta', 'Urgente'];

  constructor(
    private alertController: AlertController,
    private apiService: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.cargarAlertas();
  }

  async ionViewWillEnter() {
    await this.cargarAlertas();
  }

goToHome() {
  this.router.navigateByUrl('/home', { replaceUrl: true });
}

  scrollToForm() {
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  get alertasPendientes(): number {
    const hoy = new Date();
    return this.alertas.filter(a => {
      if (!a.fechaExpiracion) return true;
      return new Date(a.fechaExpiracion) >= hoy;
    }).length;
  }

  async cargarAlertas() {
    this.isLoading = true;
    try {
      const response = await this.apiService.getMisAlertas();
      this.alertas = response;
      console.log('📋 Alertas cargadas:', this.alertas.length);
    } catch (error) {
      console.error(' Error al cargar alertas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async generarAlerta() {
    if (!this.titulo || !this.mensaje) {
      const alert = await this.alertController.create({
        header: 'Campos incompletos',
        message: 'Por favor completa el título y el mensaje',
        buttons: ['OK'],
        cssClass: 'alerta-error'
      });
      await alert.present();
      return;
    }

    this.isLoading = true;

    const alertaData = {
      titulo: this.titulo,
      mensaje: this.mensaje,
      tipo: this.tipoAlerta,
      prioridad: this.prioridad,
      fechaExpiracion: this.fechaExpiracion
    };

    try {
      const result = await this.apiService.crearAlerta(alertaData);
      
      if (result.success) {
        // Mostrar confirmación
        const alert = await this.alertController.create({
          header: ' Alerta creada',
          message: `Se ha creado la alerta: "${this.titulo}"`,
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/home']);
            }
          }],
          cssClass: 'alerta-exito'
        });
        await alert.present();

        // Limpiar formulario
        this.titulo = '';
        this.mensaje = '';
        this.tipoAlerta = 'Info';
        this.prioridad = 'Media';
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 7);
        this.fechaExpiracion = fecha.toISOString();
      }
    } catch (error) {
      console.error('Error al crear alerta:', error);
      const alert = await this.alertController.create({
        header: '❌ Error',
        message: 'No se pudo crear la alerta',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarAlerta(id: number) {
    const alerta = this.alertas.find(a => a.id === id);
    
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Eliminar la alerta "${alerta?.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          handler: async () => {
            await this.apiService.eliminarAlerta(id);
            await this.cargarAlertas();
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarTodasAlertas() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Eliminar todas las alertas?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar todas', 
          handler: async () => {
            for (const alerta of this.alertas) {
              await this.apiService.eliminarAlerta(alerta.id);
            }
            await this.cargarAlertas();
          }
        }
      ]
    });
    await alert.present();
  }

  getColor(tipo: string): string {
    const colors: any = { 
      'Éxito': 'success', 
      'Advertencia': 'warning', 
      'Error': 'danger', 
      'Info': 'primary' 
    };
    return colors[tipo] || 'medium';
  }

  getColorBackground(tipo: string): string {
    const colors: any = { 
      'Éxito': '#10b981', 
      'Advertencia': '#f59e0b', 
      'Error': '#ef4444', 
      'Info': '#3b82f6' 
    };
    return colors[tipo] || '#6b7280';
  }

  getIcon(tipo: string): string {
    const icons: any = { 
      'Éxito': 'checkmark-circle', 
      'Advertencia': 'warning', 
      'Error': 'close-circle', 
      'Info': 'information-circle' 
    };
    return icons[tipo] || 'alert';
  }

  getPrioridadIcon(prioridad: string): string {
    const icons: any = {
      'Baja': 'arrow-down-outline',
      'Media': 'remove-outline',
      'Alta': 'arrow-up-outline',
      'Urgente': 'alert-circle-outline'
    };
    return icons[prioridad] || 'flag-outline';
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Hace ${days} días`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `Hace ${hours} horas`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `Hace ${minutes} min`;
    return 'Ahora';
  }

  formatDateExp(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  diasRestantes(date: string): number {
    if (!date) return 0;
    const hoy = new Date();
    const exp = new Date(date);
    const diff = Math.ceil((exp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  getPrioridadColor(prioridad: string): string {
    const colors: any = {
      'Baja': 'success',
      'Media': 'warning',
      'Alta': 'danger',
      'Urgente': 'dark'
    };
    return colors[prioridad] || 'medium';
  }
}
