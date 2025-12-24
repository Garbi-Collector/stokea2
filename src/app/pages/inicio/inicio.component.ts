import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import {ModalService} from "../../core/modal.service";
import {InicioModalComponent} from "../../shared/inicio-modal.component";
import {ModalComponent} from "../../shared/components/modal/modal.component";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  hasVisited = false;

  constructor(
    private storageService: StorageService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.hasVisited = this.storageService.hasVisited();

    // Si es la primera vez, abrimos el modal de bienvenida
    if (!this.hasVisited) {
      this.storageService.markAsVisited();
      this.abrirModalBienvenida();
    }
  }

  /**
   * Abre el modal de bienvenida para nuevos usuarios
   */
  abrirModalBienvenida(): void {
    this.modalService.open({
      title: '¡Bienvenido! 👋',
      component: InicioModalComponent,
      data: {
        nombre: 'Nuevo Usuario',
        mensaje: '¡Es tu primera vez aquí! Explora todas las funcionalidades disponibles.'
      },
      width: '550px',
      closable: true
    });
  }

  /**
   * Método público para abrir el modal manualmente
   * (por si quieres un botón para volver a verlo)
   */
  abrirModalInfo(): void {
    this.modalService.open({
      title: 'Información',
      component: InicioModalComponent,
      data: {
        nombre: 'Usuario Recurrente',
        mensaje: '¡Gracias por volver! Ya conoces este lugar.'
      },
      width: '550px',
      closable: true
    });
  }
}
