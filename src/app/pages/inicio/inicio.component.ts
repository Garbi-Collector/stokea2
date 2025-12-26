import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { ModalService } from "../../modalconfigs/core/modal.service";
import { ModalComponent } from "../../modalconfigs/shared/components/modal/modal.component";
import { SetupModalComponent } from "../../modals/setup-modal/setup-modal.component";
import { ProductsService } from "../../services/products.service";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  totalProducts: number = 0;
  hasProduct: boolean = true;
  name: string | null = "";
  hasVisited = false;

  // Propiedades para la caja
  cashAmount: number = 0;
  isCashVisible: boolean = true;

  constructor(
    private storageService: StorageService,
    private modalService: ModalService,
    private productService: ProductsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.hasVisited = this.storageService.hasVisited();

    if (!this.hasVisited) {
      this.abrirModalSetUp();
    }

    this.name = this.storageService.getUserName();
    this.totalProducts = await this.totalProductsCount();
    this.hasProduct = this.totalProducts > 0;

    // Cargar el monto de caja (puedes implementar este método en tu servicio)
    this.loadCashAmount();
  }

  async totalProductsCount(): Promise<number> {
    return await this.productService.count();
  }

  loadCashAmount(): void {
    // Aquí deberías cargar el monto real desde tu servicio de storage
    // Por ahora usaré un valor de ejemplo
    const savedAmount = localStorage.getItem('cashAmount');
    this.cashAmount = savedAmount ? parseFloat(savedAmount) : 0;
  }

  toggleCashVisibility(): void {
    this.isCashVisible = !this.isCashVisible;
  }

  handleIngreso(): void {
    // Implementa la lógica para registrar un ingreso
    console.log('Registrar ingreso');
    // Aquí podrías abrir otro modal o navegar a otra vista
  }

  handleEgreso(): void {
    // Implementa la lógica para registrar un egreso
    console.log('Registrar egreso');
    // Aquí podrías abrir otro modal o navegar a otra vista
  }

  abrirModalSetUp(): void {
    this.modalService.open({
      title: 'Acción Requerida',
      component: SetupModalComponent,
      data: {
        nombre: 'Usuario',
        mensaje: 'Debes completar esta configuración antes de continuar.'
      },
      width: '550px',
      closable: true,
      closeOnBackdrop: false
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
