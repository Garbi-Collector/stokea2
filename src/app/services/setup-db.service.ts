import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SetupDBService {

  private readonly STORAGE_KEY = 'stokea2_db_url';

  constructor(private http: HttpClient) {}

  /**
   * Prueba si se puede conectar a la base de datos (o API)
   */
  async testConnection(url: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.http.get(`${url}/health`, { responseType: 'text' }));
      console.log('Conexión exitosa:', response);
      return true;
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  }

  /**
   * Guarda la URL localmente
   */
  saveUrl(url: string): void {
    localStorage.setItem(this.STORAGE_KEY, url);
  }

  /**
   * Obtiene la URL guardada
   */
  getUrl(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Elimina la URL guardada
   */
  clearUrl(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

//#docker run -d --name mysql-stokeados -p 3306:3306 -v mysql-stokeados-data:/var/lib/mysql -e MYSQL_DATABASE=stokeadosDB -e MYSQL_USER=stokeados -e MYSQL_PASSWORD=stokeados -e MYSQL_ROOT_PASSWORD=rootpass123 mysql:8
