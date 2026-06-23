import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  // Inicializar la base de datos local
  async init() {
    this._storage = await this.storage.create();
    console.log(' Storage inicializado');
  }

  // Guardar un dato
  async set(key: string, value: any): Promise<void> {
    await this._storage?.set(key, value);
    console.log(` Guardado: ${key} =`, value);
  }

  // Obtener un dato
  async get(key: string): Promise<any> {
    const value = await this._storage?.get(key);
    console.log(` Leído: ${key} =`, value);
    return value;
  }

  // Eliminar un dato
  async remove(key: string): Promise<void> {
    await this._storage?.remove(key);
    console.log(`Eliminado: ${key}`);
  }

  // Limpiar todos los datos
  async clear(): Promise<void> {
    await this._storage?.clear();
    console.log(' Storage limpiado');
  }

  // Verificar si existe una clave
  async has(key: string): Promise<boolean> {
    const value = await this._storage?.get(key);
    return value !== null && value !== undefined;
  }

  // Obtener todas las claves
  async keys(): Promise<string[]> {
    return await this._storage?.keys() || [];
  }
}