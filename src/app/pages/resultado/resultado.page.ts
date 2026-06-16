import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './resultado.page.html',
  styleUrls: ['./resultado.page.scss']
})
export class ResultadoPage implements OnInit {
  licenciaData: any = {};
  isExporting = false;

  constructor(
    private router: Router,
    private platform: Platform,
    private alertController: AlertController
  ) {
    console.log('📄 ResultadoPage constructor');
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ionViewWillEnter() {
    console.log('📄 ResultadoPage ionViewWillEnter');
    this.cargarDatos();
  }

  cargarDatos() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as any;
    
    console.log('📦 State recibido:', state);
    
    if (state?.licenciaData) {
      this.licenciaData = state.licenciaData;
      console.log('✅ Licencia cargada:', this.licenciaData);
    } else {
      console.warn('⚠️ No hay datos de licencia');
      // Si no hay datos, redirigir a home
      setTimeout(() => {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }, 1000);
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date);
    } else {
      d = date;
    }
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatDateForText(): string {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  }

  async copyCode() {
    if (this.licenciaData.codigoLicencia) {
      await navigator.clipboard.writeText(this.licenciaData.codigoLicencia);
      await this.showToast('📋 Código copiado al portapapeles');
    }
  }

  async copyAll() {
    const texto = this.generarTextoCompleto();
    await navigator.clipboard.writeText(texto);
    await this.showToast('📋 Todos los datos copiados');
  }

  generarTextoCompleto(): string {
    const precio = this.licenciaData.moneda === 'USD' 
      ? `$${this.licenciaData.precioTotalUSD} USD`
      : `S/ ${this.licenciaData.precioTotalPEN} PEN`;
    
    const fechaGeneracion = this.formatDateForText();
    
    return `
═══════════════════════════════════════
          LICENCIA GENERADA
═══════════════════════════════════════

🔑 CÓDIGO: ${this.licenciaData.codigoLicencia}

📦 PRODUCTO: ${this.licenciaData.producto}
📌 TIPO: ${this.licenciaData.tipo}
📅 VENCIMIENTO: ${this.formatDate(this.licenciaData.fechaVencimiento)}
🎫 CANTIDAD: ${this.licenciaData.cantidadLicencias} licencia(s)
💰 TOTAL: ${precio}

───────────────────────────────────────
         👤 DATOS DEL CLIENTE
───────────────────────────────────────

👤 CLIENTE: ${this.licenciaData.cliente}
🏢 EMPRESA: ${this.licenciaData.empresa || 'No especificada'}
📧 EMAIL: ${this.licenciaData.correo}

───────────────────────────────────────
📅 GENERADA: ${fechaGeneracion}
═══════════════════════════════════════
    `;
  }

  async exportToPDF() {
    this.isExporting = true;
    
    const element = document.getElementById('licencia-content');
    if (!element) {
      await this.showToast('❌ Error al generar PDF');
      this.isExporting = false;
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#1A1F3D',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`licencia_${this.licenciaData.codigoLicencia}.pdf`);
      
      await this.showToast('📄 PDF generado correctamente');
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      await this.showToast('❌ Error al generar PDF');
    } finally {
      this.isExporting = false;
    }
  }

  async shareWhatsApp() {
    const texto = this.generarTextoCompleto();
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  async shareFacebook() {
    const texto = this.generarTextoCompleto();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://localhost:8100')}&quote=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  async shareTwitter() {
    const texto = this.generarTextoCompleto();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  async shareTikTok() {
    await this.copyAll();
    await this.showToast('📱 Texto copiado. Pégalo en TikTok');
  }

  async shareNative() {
    if (this.platform.is('capacitor')) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: 'Licencia Generada',
          text: this.generarTextoCompleto(),
          dialogTitle: 'Compartir licencia'
        });
      } catch (error) {
        console.error('❌ Error al compartir:', error);
        await this.copyAll();
      }
    } else {
      await this.copyAll();
      await this.showToast('📋 Texto copiado. Pégalo donde quieras');
    }
  }

  async showToast(message: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: message,
      buttons: ['OK'],
      cssClass: 'success-alert'
    });
    await alert.present();
  }

  nuevaLicencia() {
    console.log('🔄 Creando nueva licencia');
    this.router.navigateByUrl('/crear-licencia', { replaceUrl: true })
      .then(() => {
        console.log('✅ Navegación a crear-licencia exitosa');
      })
      .catch(err => {
        console.error('❌ Error navegando:', err);
      });
  }

  goToHome() {
    console.log('🏠 Volviendo a home');
    this.router.navigateByUrl('/home', { replaceUrl: true })
      .then(() => {
        console.log('✅ Navegación a home exitosa');
      })
      .catch(err => {
        console.error('❌ Error navegando:', err);
      });
  }
}