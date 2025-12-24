import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {ModalConfig} from "../../../models/modalconfig";
import {ModalService} from "../../../core/modal.service";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('dynamicContent', { read: ViewContainerRef }) dynamicContent!: ViewContainerRef;

  modalConfig: ModalConfig | null = null;
  private subscription!: Subscription;
  private componentRef?: ComponentRef<any>;

  // Variables para el arrastre
  isDragging = false;
  currentX = 0;
  currentY = 0;
  initialX = 0;
  initialY = 0;
  offsetX = 0;
  offsetY = 0;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription = this.modalService.modal$.subscribe(config => {
      this.modalConfig = config;

      if (config) {
        // Resetear posición al centro cuando se abre un nuevo modal
        setTimeout(() => this.centerModal(), 0);

        // Cargar componente dinámico si existe
        if (config.component) {
          this.loadDynamicComponent(config);
        }
      } else {
        // Limpiar componente cuando se cierra
        this.clearDynamicComponent();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.clearDynamicComponent();
  }

  private loadDynamicComponent(config: ModalConfig): void {
    if (!this.dynamicContent) return;

    this.clearDynamicComponent();
    this.componentRef = this.dynamicContent.createComponent(config.component!);

    // Pasar datos al componente si existen
    if (config.data && this.componentRef.instance) {
      Object.assign(this.componentRef.instance, config.data);
    }
  }

  private clearDynamicComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    if (this.dynamicContent) {
      this.dynamicContent.clear();
    }
  }

  closeModal(): void {
    if (this.modalConfig?.closable !== false) {
      this.modalService.close();
    }
  }

  // Métodos para el arrastre
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.initialX = event.clientX - this.offsetX;
    this.initialY = event.clientY - this.offsetY;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;
      this.offsetX = this.currentX;
      this.offsetY = this.currentY;
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  private centerModal(): void {
    this.currentX = 0;
    this.currentY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  getModalStyle(): any {
    return {
      transform: `translate(${this.currentX}px, ${this.currentY}px)`,
      width: this.modalConfig?.width || '600px',
      height: this.modalConfig?.height || 'auto'
    };
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
