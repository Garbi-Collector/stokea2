import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { StockService } from '../../services/stock.service';
import { Product } from '../../models/product';
import { Stock } from '../../models/stock';

interface CartItem {
  product: Product;
  quantity: number;
  stock: number;
  subtotal: number;
}

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrls: [
    './venta.component.css',
    './../../style/animations.css',
    './../../style/badges.css',
    './../../style/buttons.css',
    './../../style/cards.css',
    './../../style/colors.css',
    './../../style/forms.css',
    './../../style/tables.css',
    './../../style/typography.css',
  ]
})
export class VentaComponent implements OnInit, AfterViewInit {
  @ViewChild('codeInput') codeInput!: ElementRef<HTMLInputElement>;

  // Form fields
  productCode: string = '';
  productName: string = '';
  brand: string = '';
  salePrice: number = 0;
  stockQuantity: number = 0;
  description: string = '';
  quantityToAdd: number = 1;

  // Cart
  cart: CartItem[] = [];
  total: number = 0;

  // UI states
  isLoading: boolean = false;
  productNotFound: boolean = false;
  currentProduct: Product | null = null;
  currentStock: Stock | null = null;

  constructor(
    private productsService: ProductsService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    // Initialization logic here if needed
  }

  ngAfterViewInit(): void {
    // Auto-focus on code input when component loads
    setTimeout(() => {
      this.codeInput?.nativeElement.focus();
    }, 100);
  }

  async onCodeChange(): Promise<void> {
    if (!this.productCode.trim()) {
      this.clearProductFields();
      return;
    }

    // Search product by code
    await this.searchProductByCode(this.productCode);
  }

  async onNameChange(): Promise<void> {
    if (!this.productName.trim()) {
      return;
    }

    // Search product by name (implement search logic)
    // For now, this is a placeholder
  }

  async searchProductByCode(code: string): Promise<void> {
    try {
      this.isLoading = true;
      this.productNotFound = false;

      const products: Product[] = await this.productsService.getAll();
      const product = products.find(p => p.code === code);

      if (product) {
        await this.loadProduct(product);
      } else {
        this.productNotFound = true;
        this.clearProductFields();
      }
    } catch (error) {
      console.error('Error searching product:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadProduct(product: Product): Promise<void> {
    this.currentProduct = product;
    this.productName = product.name;
    this.brand = product.brand || '';
    this.salePrice = product.sale_price;
    this.description = product.description || '';
    this.productNotFound = false;

    // Load stock
    if (product.id) {
      try {
        const stock: Stock = await this.stockService.getByProduct(product.id);
        this.currentStock = stock;
        this.stockQuantity = stock.quantity;
      } catch (error) {
        this.stockQuantity = 0;
        this.currentStock = null;
      }
    }
  }

  clearProductFields(): void {
    this.currentProduct = null;
    this.currentStock = null;
    this.productName = '';
    this.brand = '';
    this.salePrice = 0;
    this.stockQuantity = 0;
    this.description = '';
    this.productNotFound = false;
  }

  addToCart(): void {
    if (!this.currentProduct || this.quantityToAdd <= 0) {
      return;
    }

    if (this.quantityToAdd > this.stockQuantity) {
      alert('La cantidad solicitada excede el stock disponible');
      return;
    }

    // Check if product already in cart
    const existingItem = this.cart.find(item => item.product.id === this.currentProduct?.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + this.quantityToAdd;
      if (newQuantity > this.stockQuantity) {
        alert('La cantidad total excede el stock disponible');
        return;
      }
      existingItem.quantity = newQuantity;
      existingItem.subtotal = existingItem.quantity * existingItem.product.sale_price;
    } else {
      this.cart.push({
        product: this.currentProduct,
        quantity: this.quantityToAdd,
        stock: this.stockQuantity,
        subtotal: this.quantityToAdd * this.currentProduct.sale_price
      });
    }

    this.calculateTotal();
    this.resetForm();
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.calculateTotal();
  }

  updateCartItemQuantity(item: CartItem): void {
    if (item.quantity <= 0) {
      return;
    }
    if (item.quantity > item.stock) {
      alert('La cantidad excede el stock disponible');
      item.quantity = item.stock;
    }
    item.subtotal = item.quantity * item.product.sale_price;
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
  }

  resetForm(): void {
    this.productCode = '';
    this.quantityToAdd = 1;
    this.clearProductFields();
    this.codeInput?.nativeElement.focus();
  }

  completeSale(): void {
    if (this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Logic to complete sale will be implemented here
    console.log('Completing sale:', this.cart);
    alert('Venta completada (funcionalidad pendiente)');

    // Clear cart after sale
    this.cart = [];
    this.total = 0;
    this.resetForm();
  }

  cancelSale(): void {
    if (this.cart.length > 0) {
      if (confirm('¿Desea cancelar la venta? Se perderán todos los items del carrito.')) {
        this.cart = [];
        this.total = 0;
        this.resetForm();
      }
    }
  }
}
