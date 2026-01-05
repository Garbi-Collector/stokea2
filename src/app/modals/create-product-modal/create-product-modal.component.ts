import { Component } from '@angular/core';
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ModalService } from "../../modalconfigs/core/modal.service";
import { ProductsService } from "../../services/products.service";
import { StockService } from "../../services/stock.service";
import {ProductForm} from "../../models/ProductForm";


@Component({
  selector: 'app-create-product-modal',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './create-product-modal.component.html',
  styleUrl: './create-product-modal.component.css'
})
export class CreateProductModalComponent {

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

  constructor(
    private modalService: ModalService,
    private productsService: ProductsService,
    private stockService: StockService
  ) {}

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
      // Recalcular el porcentaje de ganancia basado en el precio de venta modificado
      const profit = this.editableSalePrice - this.form.wholesale_price;
      this.form.profit_percentage = (profit / this.form.wholesale_price) * 100;

      // Redondear a 2 decimales para evitar problemas de precisión
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
      // Crear producto
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

      // Crear stock
      const stock = {
        product_id: createdProduct.id,
        quantity: this.form.quantity!,
        min_alert: this.form.min_alert || 0
      };

      await this.stockService.create(stock);

      console.log('Producto y stock creados exitosamente');
      this.modalService.close();
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto. Por favor, intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelar(): void {
    this.modalService.close();
  }
}
