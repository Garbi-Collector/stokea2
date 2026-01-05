import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../modalconfigs/core/modal.service';
import { StockService } from '../../services/stock.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-eliminate-product-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminate-product-modal.component.html',
  styleUrl: './eliminate-product-modal.component.css'
})
export class EliminateProductModalComponent implements OnInit {

  @Input() productId!: number;

  currentStep: 1 | 2 = 1;
  isDeleting = false;
  error: string | null = null;

  // Datos del producto
  product: any = null;
  stockItems: any[] = [];
  totalStock = 0;

  // Resultado de la eliminación
  deletedStockCount = 0;
  deletedProductName = '';

  constructor(
    private modalService: ModalService,
    private productsService: ProductsService,
    private stockService: StockService
  ) {}

  async ngOnInit() {
    await this.loadProductData();
  }

  async loadProductData() {
    try {
      this.product = await this.productsService.getById(this.productId);
      this.stockItems = await this.stockService.getByProduct(this.productId);
      this.totalStock = this.stockItems.length;
    } catch (e) {
      console.error(e);
      this.error = 'Error al cargar los datos del producto';
    }
  }

  cerrar(): void {
    this.modalService.close();
  }

  async eliminar(): Promise<void> {
    if (this.isDeleting) return;

    this.isDeleting = true;
    this.error = null;

    try {
      this.deletedProductName = this.product?.name || 'Producto';
      this.deletedStockCount = this.totalStock;

      await this.stockService.deleteByProduct(this.productId);
      await this.productsService.delete(this.productId);

      this.currentStep = 2;
      this.isDeleting = false;
    } catch (e) {
      console.error(e);
      this.error = 'Ocurrió un error al eliminar el producto';
      this.isDeleting = false;
    }
  }
}
