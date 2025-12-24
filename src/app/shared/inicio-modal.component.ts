import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModalService} from "../core/modal.service";

@Component({
  selector: 'app-inicio-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inicio-content">
      <h2>¡Bienvenido!</h2>
      <p>Este es el contenido del modal de inicio.</p>

      <div class="info-section">
        <p><strong>Nombre:</strong> {{ nombre || 'Usuario' }}</p>
        <p><strong>Mensaje:</strong> {{ mensaje || 'Sin mensaje' }}</p>
      </div>

      <div class="actions">
        <button class="btn btn-primary" (click)="aceptar()">
          Aceptar
        </button>
        <button class="btn btn-secondary" (click)="cerrar()">
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .inicio-content {
      font-family: system-ui, -apple-system, sans-serif;
    }

    h2 {
      color: #333;
      margin-bottom: 16px;
    }

    .info-section {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
    }

    .info-section p {
      margin: 8px 0;
      color: #555;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .btn:active {
      transform: translateY(0);
    }
  `]
})
export class InicioModalComponent {
  @Input() nombre?: string;
  @Input() mensaje?: string;

  constructor(private modalService: ModalService) {}

  aceptar(): void {
    console.log('Acción aceptada');
    this.modalService.close();
  }

  cerrar(): void {
    this.modalService.close();
  }
}
