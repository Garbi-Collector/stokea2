import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalConfig } from "../../../../models/modalconfig";
import { ModalService } from "../../../core/modal.service";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked{
  @ViewChild('dynamicContent', {
    read: ViewContainerRef,
    static: false
  })  dynamicContent!: ViewContainerRef;
  @ViewChild('modalContainer') modalContainer!: ElementRef<HTMLDivElement>;

  modalConfig: ModalConfig | null = null;
  private subscription!: Subscription;
  private componentRef?: ComponentRef<any>;
  private pendingConfig: ModalConfig | null = null;

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
        this.centerModal();

        if (this.dynamicContent) {
          this.loadDynamicComponent(config);
        } else {
          this.pendingConfig = config;
        }
      } else {
        this.clearDynamicComponent();
        this.pendingConfig = null;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (
      this.modalConfig &&
      this.modalConfig.component &&
      this.dynamicContent &&
      !this.componentRef
    ) {
      this.loadDynamicComponent(this.modalConfig);
    }
  }

  ngAfterViewInit(): void {
    if (this.pendingConfig && this.pendingConfig.component) {
      setTimeout(() => {
        this.loadDynamicComponent(this.pendingConfig!);
        this.pendingConfig = null;
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.clearDynamicComponent();
  }

  private loadDynamicComponent(config: ModalConfig): void {
    if (!config.component || !this.dynamicContent) {
      return;
    }


    this.clearDynamicComponent();

    try {
      this.componentRef = this.dynamicContent.createComponent(config.component);

      if (config.data && this.componentRef.instance) {
        Object.keys(config.data).forEach(key => {
          this.componentRef!.instance[key] = config.data[key];
        });

        if (this.componentRef.changeDetectorRef) {
          this.componentRef.changeDetectorRef.detectChanges();
        }
      }
    } catch (error) {
      console.error('Error al cargar componente dinámico:', error);
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

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.initialX = event.clientX - this.offsetX;
    this.initialY = event.clientY - this.offsetY;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.modalContainer) {
      event.preventDefault();

      let newX = event.clientX - this.initialX;
      let newY = event.clientY - this.initialY;

      const modalElement = this.modalContainer.nativeElement;
      const modalRect = modalElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const minVisibleArea = 50;
      const maxX = viewportWidth - minVisibleArea;
      const minX = -(modalRect.width - minVisibleArea);
      const maxY = viewportHeight - minVisibleArea;
      const minY = 0;

      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      this.currentX = newX;
      this.currentY = newY;
      this.offsetX = newX;
      this.offsetY = newY;
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

  /**
   * Maneja el click en el backdrop
   * Solo cierra si closeOnBackdrop es true (por defecto)
   */
  onBackdropClick(event: MouseEvent): void {
    // Verificar si el click fue en el backdrop y no en el modal
    if (event.target === event.currentTarget) {
      // closeOnBackdrop por defecto es true si no se especifica
      const canCloseOnBackdrop = this.modalConfig?.closeOnBackdrop !== false;

      if (canCloseOnBackdrop && this.modalConfig?.closable !== false) {
        this.closeModal();
      }
    }
  }

  /**
   * Determina si debe mostrar el botón de cerrar
   * Solo se muestra si closable es true Y closeOnBackdrop es true
   */
  shouldShowCloseButton(): boolean {
    return this.modalConfig?.closable !== false &&
      this.modalConfig?.closeOnBackdrop !== false;
  }
}
