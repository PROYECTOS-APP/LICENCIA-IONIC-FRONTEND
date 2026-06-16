export class PriceUtils {
  static TIPO_CAMBIO_USD_PEN = 3.80;

  static convertirUSDtoPEN(usd: number): number {
    return usd * this.TIPO_CAMBIO_USD_PEN;
  }

  static convertirPENtoUSD(pen: number): number {
    return pen / this.TIPO_CAMBIO_USD_PEN;
  }

  static formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatPEN(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatMoneda(amount: number, moneda: string): string {
    if (moneda === 'PEN') {
      return this.formatPEN(amount);
    }
    return this.formatUSD(amount);
  }
}