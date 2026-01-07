import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ModalService } from "../../modalconfigs/core/modal.service";
import { ProductsService } from "../../services/products.service";
import { StockService } from "../../services/stock.service";
import { ProductForm } from "../../models/ProductForm";
import { ProductWithStock } from "../../models/ProductWithStock";

@Component({
  selector: 'app-create-product-modal',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './create-product-modal.component.html',
  styleUrl: './create-product-modal.component.css'
})
export class CreateProductModalComponent implements OnInit {
  @Input() data: any; // Recibe los datos del modal

  form: ProductForm = {
    name: '',
    description: '',
    brand: '',
    code: '',
    wholesale_price: null,
    profit_percentage: null,
    quantity: null,
    min_alert: null
  };

  editableSalePrice: number | null = null;
  showErrors: { [key: string]: boolean } = {};
  isSubmitting = false;
  isEditMode = false;
  productId?: number;
  stockId?: number;

  constructor(
    private modalService: ModalService,
    private productsService: ProductsService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    // Si recibimos datos de un producto, es modo edición
    if (this.data?.isEdit && this.data?.producto) {
      this.isEditMode = true;
      this.cargarDatosProducto(this.data.producto);
    }
  }

  cargarDatosProducto(producto: ProductWithStock): void {
    this.productId = producto.id;
    this.stockId = producto.stockId;

    this.form = {
      name: producto.nombre,
      description: producto.descripcion || '',
      brand: producto.marca || '',
      code: producto.codigo,
      wholesale_price: producto.precioMayorista,
      profit_percentage: this.calcularPorcentajeGanancia(
        producto.precioMayorista,
        producto.precioMinorista
      ),
      quantity: producto.cantidad,
      min_alert: producto.minAlert || null
    };

    this.editableSalePrice = producto.precioMinorista;
  }

  calcularPorcentajeGanancia(precioCompra: number, precioVenta: number): number {
    if (precioCompra <= 0) return 0;
    const ganancia = precioVenta - precioCompra;
    return Math.round((ganancia / precioCompra) * 100 * 100) / 100;
  }

  get salePrice(): number {
    if (this.editableSalePrice !== null && this.editableSalePrice > 0) {
      return this.editableSalePrice;
    }

    if (this.form.wholesale_price && this.form.profit_percentage !== null) {
      const profit = this.form.wholesale_price * (this.form.profit_percentage / 100);
      return this.form.wholesale_price + profit;
    }
    return 0;
  }

  onWholesalePriceChange(): void {
    this.validateField('wholesale_price');
    this.recalculateSalePrice();
  }

  onProfitPercentageChange(): void {
    this.validateField('profit_percentage');
    this.recalculateSalePrice();
  }

  recalculateSalePrice(): void {
    if (this.form.wholesale_price && this.form.profit_percentage !== null) {
      const profit = this.form.wholesale_price * (this.form.profit_percentage / 100);
      this.editableSalePrice = this.form.wholesale_price + profit;
    } else {
      this.editableSalePrice = null;
    }
  }

  onSalePriceChange(): void {
    if (this.editableSalePrice !== null && this.form.wholesale_price && this.form.wholesale_price > 0) {
      const profit = this.editableSalePrice - this.form.wholesale_price;
      this.form.profit_percentage = (profit / this.form.wholesale_price) * 100;
      this.form.profit_percentage = Math.round(this.form.profit_percentage * 100) / 100;
    }
  }

  validateField(field: keyof ProductForm): void {
    this.showErrors[field] = false;
  }

  isValidForm(): boolean {
    return (
      this.form.name.trim().length >= 3 &&
      this.form.code.trim().length >= 1 &&
      this.form.wholesale_price !== null &&
      this.form.wholesale_price > 0 &&
      this.form.profit_percentage !== null &&
      this.form.profit_percentage >= 0 &&
      this.form.quantity !== null &&
      this.form.quantity >= 0
    );
  }

  async guardar(): Promise<void> {
    if (!this.isValidForm()) {
      this.showErrors = {
        name: this.form.name.trim().length < 3,
        code: this.form.code.trim().length < 1,
        wholesale_price: !this.form.wholesale_price || this.form.wholesale_price <= 0,
        profit_percentage: this.form.profit_percentage === null || this.form.profit_percentage < 0,
        quantity: this.form.quantity === null || this.form.quantity < 0
      };
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.isEditMode) {
        await this.actualizarProducto();
      } else {
        await this.crearProducto();
      }

      console.log(`Producto ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`);
      this.modalService.close(true); // Pasamos true para indicar éxito
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} el producto. Por favor, intenta nuevamente.`);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async crearProducto(): Promise<void> {
    const product = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      brand: this.form.brand.trim(),
      code: this.form.code.trim(),
      wholesale_price: this.form.wholesale_price!,
      profit_percentage: this.form.profit_percentage!,
      sale_price: this.salePrice
    };

    const createdProduct = await this.productsService.create(product);

    const stock = {
      product_id: createdProduct.id,
      quantity: this.form.quantity!,
      min_alert: this.form.min_alert || 0
    };

    await this.stockService.create(stock);
  }

  private async actualizarProducto(): Promise<void> {
    if (!this.productId) {
      throw new Error('ID de producto no disponible');
    }

    const product = {
      id: this.productId,
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      brand: this.form.brand.trim(),
      code: this.form.code.trim(),
      wholesale_price: this.form.wholesale_price!,
      profit_percentage: this.form.profit_percentage!,
      sale_price: this.salePrice
    };

    await this.productsService.update(this.productId, product);

    if (this.stockId) {
      const stock = {
        quantity: this.form.quantity!,
        min_alert: this.form.min_alert || 0
      };
      await this.stockService.update(this.stockId, stock);
    }
  }

  cancelar(): void {
    this.modalService.close();
  }
}
