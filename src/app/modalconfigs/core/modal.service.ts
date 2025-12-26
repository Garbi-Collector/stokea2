import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalConfig } from "../../models/modalconfig";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modalSubject = new BehaviorSubject<ModalConfig | null>(null);
  modal$ = this.modalSubject.asObservable();

  constructor() {}

  /**
   * Abre un modal con la configuración dada
   */
  open(config: ModalConfig): void {
    this.modalSubject.next({
      closable: true,
      closeOnBackdrop: true, // Por defecto se puede cerrar tocando el fondo
      ...config
    });
  }

  /**
   * Cierra el modal actual
   */
  close(): void {
    this.modalSubject.next(null);
  }

  /**
   * Devuelve true si hay un modal abierto
   */
  isOpen(): boolean {
    return this.modalSubject.value !== null;
  }
}
