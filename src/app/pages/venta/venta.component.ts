import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { StockService } from '../../services/stock.service';
import { CashSessionService } from '../../services/cash-session.service';
import { SalesService } from '../../services/sales.service';
import { SaleItemsService } from '../../services/sale-items.service';
import { Product } from '../../models/product';
import { Stock } from '../../models/stock';
import { CashSession } from '../../models/cash-session';

interface ProductWithStock extends Product {
  stock?: Stock;
  availableQuantity: number;
}

interface CartItem {
  product: ProductWithStock;
  quantity: number;
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
export class VentaComponent implements OnInit {
  // Productos y búsqueda
  products: ProductWithStock[] = [];
  filteredProducts: ProductWithStock[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  // Carrito (estático - se mantiene mientras la app esté abierta)
  static cart: CartItem[] = [];

  // Cash session actual
  currentSession: CashSession | null = null;

  // Estados
  isProcessingSale: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private productsService: ProductsService,
    private stockService: StockService,
    private cashSessionService: CashSessionService,
    private salesService: SalesService,
    private saleItemsService: SaleItemsService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Cargar sesión de caja actual
      await this.loadCashSession();

      // Cargar productos y stock
      const [products, stocks] = await Promise.all([
        this.productsService.getAll(),
        this.stockService.getAll()
      ]);

      // Combinar productos con su stock
      this.products = products.map(product => {
        const stock = stocks.find(s => s.product_id === product.id);
        return {
          ...product,
          stock,
          availableQuantity: stock?.quantity || 0
        };
      });

      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.errorMessage = 'Error al cargar los productos. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadCashSession() {
    try {
      const openSession = await this.cashSessionService.getOpen();

      if (openSession) {
        this.currentSession = openSession;
      } else {
        // Si no hay sesión abierta, intentar crear una nueva
        this.currentSession = await this.cashSessionService.createNewSession();
      }
    } catch (error) {
      console.error('Error con la sesión de caja:', error);
      this.errorMessage = 'Error: No hay sesión de caja disponible. Por favor, abre una sesión primero.';
    }
  }

  // Búsqueda de productos
  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredProducts = [...this.products];
      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.code.toLowerCase().includes(term) ||
      (product.brand && product.brand.toLowerCase().includes(term)) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  // Gestión del carrito
  get cart(): CartItem[] {
    return VentaComponent.cart;
  }

  get cartTotal(): number {
    return this.cart.reduce((total, item) => total + item.subtotal, 0);
  }

  get cartItemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  addToCart(product: ProductWithStock, quantityToAdd: number = 1) {
    // Validaciones
    if (!product.stock || product.availableQuantity <= 0) {
      this.showError('Producto sin stock disponible');
      return;
    }

    // Buscar si el producto ya está en el carrito
    const existingItem = this.cart.find(item => item.product.id === product.id);

    if (existingItem) {
      // Validar que no se exceda el stock disponible
      const newQuantity = existingItem.quantity + quantityToAdd;

      if (newQuantity > product.availableQuantity) {
        this.showError(`Stock insuficiente. Disponible: ${product.availableQuantity}`);
        return;
      }

      // Actualizar cantidad y subtotal
      existingItem.quantity = newQuantity;
      existingItem.subtotal = existingItem.quantity * product.sale_price;
      this.showSuccess(`Cantidad actualizada: ${existingItem.quantity}`);
    } else {
      // Validar cantidad inicial
      if (quantityToAdd > product.availableQuantity) {
        this.showError(`Stock insuficiente. Disponible: ${product.availableQuantity}`);
        return;
      }

      // Agregar nuevo item al carrito
      this.cart.push({
        product,
        quantity: quantityToAdd,
        subtotal: quantityToAdd * product.sale_price
      });
      this.showSuccess('Producto agregado al carrito');
    }
  }

  removeFromCart(index: number) {
    const item = this.cart[index];
    this.cart.splice(index, 1);
    this.showSuccess(`${item.product.name} eliminado del carrito`);
  }

  updateCartItemQuantity(index: number, newQuantity: number) {
    const item = this.cart[index];

    if (newQuantity <= 0) {
      this.removeFromCart(index);
      return;
    }

    if (newQuantity > item.product.availableQuantity) {
      this.showError(`Stock insuficiente. Disponible: ${item.product.availableQuantity}`);
      return;
    }

    item.quantity = newQuantity;
    item.subtotal = item.quantity * item.product.sale_price;
  }

  clearCart() {
    VentaComponent.cart = [];
    this.showSuccess('Carrito vaciado');
  }

  // Procesar venta
  async processSale() {
    if (this.cart.length === 0) {
      this.showError('El carrito está vacío');
      return;
    }

    if (!this.currentSession) {
      this.showError('No hay sesión de caja activa');
      return;
    }

    if (this.isProcessingSale) {
      return;
    }

    this.isProcessingSale = true;
    this.errorMessage = '';

    try {
      // 1. Crear la venta
      const sale = await this.salesService.create({
        cash_session_id: this.currentSession.id,
        total: this.cartTotal
      });

      // 2. Crear los items de venta y actualizar stock
      for (const cartItem of this.cart) {
        // Crear sale item
        await this.saleItemsService.create({
          sale_id: sale.id,
          product_id: cartItem.product.id,
          quantity: cartItem.quantity,
          unit_price: cartItem.product.sale_price,
          subtotal: cartItem.subtotal
        });

        // Actualizar stock
        if (cartItem.product.stock) {
          const newQuantity = cartItem.product.stock.quantity - cartItem.quantity;
          await this.stockService.update(cartItem.product.stock.id!, {
            quantity: newQuantity
          });
        }
      }

      // 3. Actualizar el monto de la sesión de caja
      await this.cashSessionService.updateCurrentAmount(
        this.currentSession.id!,
        this.cartTotal
      );

      // 4. Limpiar carrito y recargar datos
      this.clearCart();
      await this.loadData();

      this.showSuccess(`Venta procesada exitosamente. Total: $${this.cartTotal.toFixed(2)}`);
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      this.showError('Error al procesar la venta. Intenta nuevamente.');
    } finally {
      this.isProcessingSale = false;
    }
  }

  // Utilidades
  getStockBadgeClass(quantity: number): string {
    if (quantity === 0) return 'no-stock';
    if (quantity <= 10) return 'low-stock';
    return '';
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 4000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
