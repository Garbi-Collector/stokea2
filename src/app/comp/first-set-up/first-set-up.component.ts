import { Component } from '@angular/core';
import {SetupDBService} from "../../services/setup-db.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-first-set-up',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './first-set-up.component.html',
  styleUrl: './first-set-up.component.css'
})
export class FirstSetUpComponent {
  dbUrl: string = '';
  isLoading: boolean = false;
  connectionResult: 'success' | 'error' | null = null;
  errorMessage: string = '';

  constructor(private setupDBService: SetupDBService) {}

  async testConnection() {
    if (!this.dbUrl.trim()) {
      this.connectionResult = 'error';
      this.errorMessage = 'Por favor ingresa una URL';
      return;
    }

    this.isLoading = true;
    this.connectionResult = null;
    this.errorMessage = '';

    try {
      const success = await this.setupDBService.testConnection(this.dbUrl);

      if (success) {
        this.connectionResult = 'success';
        this.setupDBService.saveUrl(this.dbUrl);
      } else {
        this.connectionResult = 'error';
        this.errorMessage = 'No se pudo conectar a la base de datos';
      }
    } catch (error: any) {
      this.connectionResult = 'error';
      this.errorMessage = `No se pudo conectar: ${error.message || error.statusText || 'Error desconocido'}`;
    } finally {
      this.isLoading = false;
    }
  }
}
