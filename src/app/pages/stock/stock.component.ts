import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ProductsService} from "../../services/products.service";
import {StockService} from "../../services/stock.service";
import {Stock} from "../../models/stock";
import {Product} from "../../models/product";
import {ProductWithStock} from "../../models/ProductWithStock";
import {ModalService} from "../../modalconfigs/core/modal.service";
import {CreateProductModalComponent} from "../../modals/create-product-modal/create-product-modal.component";
import {ModalComponent} from "../../modalconfigs/shared/components/modal/modal.component";
import {EliminateProductModalComponent} from "../../modals/eliminate-product-modal/eliminate-product-modal.component";


@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent implements OnInit, AfterViewInit{
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchTerm: string = '';
  sortBy: string = 'nombre';
  sortOrder: 'asc' | 'desc' = 'asc';

  productos: ProductWithStock[] = [];
  productosFiltrados: ProductWithStock[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private modalService: ModalService,
    private productsService: ProductsService,
    private stockService: StockService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadProductsWithStock();

    // Suscribirse a los cierres del modal
    this.modalService.close$.subscribe(success => {
      if (success) {
        this.refreshData();
      }
    });
  }

  async loadProductsWithStock() {
    try {
      this.isLoading = true;
      this.error = null;

      // Obtener productos y stock en paralelo
      const [products, stocks] = await Promise.all([
        this.productsService.getAll(),
        this.stockService.getAll()
      ]);

      // Crear un mapa de stock por product_id para búsqueda rápida
      const stockMap = new Map<number, Stock>();
      stocks.forEach((stock: Stock) => {
        stockMap.set(stock.product_id, stock);
      });

      // Combinar productos con su stock
      this.productos = products.map((product: Product) => {
        const stock = stockMap.get(product.id!);

        return {
          id: product.id!,
          cantidad: stock?.quantity || 0,
          nombre: product.name,
          descripcion: product.description || '',
          marca: product.brand || '',
          codigo: product.code,
          precioMayorista: product.wholesale_price,
          precioMinorista: product.sale_price,
          created_at: product.created_at || '',
          stockId: stock?.id,
          minAlert: stock?.min_alert
        };
      });

      this.aplicarFiltrosYOrdenamiento();
      this.isLoading = false;

      // Forzamos el render antes de hacer focus
      this.cdr.detectChanges();

      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      });


    } catch (err) {
      console.error('Error al cargar productos con stock:', err);
      this.error = 'Error al cargar los productos. Por favor, intenta nuevamente.';
      this.isLoading = false;
    }
  }

  aplicarFiltrosYOrdenamiento() {
    // Filtrar por búsqueda
    let resultado = [...this.productos];

    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.codigo.toLowerCase().includes(termino)
      );
    }

    // Ordenar
    resultado.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.sortBy) {
        case 'nombre':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'precio':
          valorA = a.precioMinorista;
          valorB = b.precioMinorista;
          break;
        case 'cantidad':
          valorA = a.cantidad;
          valorB = b.cantidad;
          break;
        case 'fecha':
          valorA = new Date(a.created_at || 0).getTime();
          valorB = new Date(b.created_at || 0).getTime();
          break;
        default:
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
      }

      if (valorA < valorB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.productosFiltrados = resultado;
  }

  onSearchChange() {
    this.aplicarFiltrosYOrdenamiento();
  }

  onSortByChange() {
    this.aplicarFiltrosYOrdenamiento();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.aplicarFiltrosYOrdenamiento();
  }



  async refreshData() {
    await this.loadProductsWithStock();
  }

  abrirModalCreateProduct(): void {
    this.modalService.open({
      title: 'Crear Producto',
      component: CreateProductModalComponent,
      data: {
        nombre: 'Producto',
        mensaje: 'podes crear productos y agregarlos a tu stock.'
      },
      width: '550px',
      closable: true,
      closeOnBackdrop: false
    });
  }

  editarProducto(producto: ProductWithStock) {
    this.modalService.open({
      title: 'Editar Producto',
      component: CreateProductModalComponent,
      data: {
        producto: producto, // Pasamos el producto completo
        isEdit: true // Flag para indicar que es edición
      },
      width: '550px',
      closable: true,
      closeOnBackdrop: false
    });
  }

  eliminarProducto(producto: ProductWithStock) {
    this.modalService.open({
      title: 'Eliminar Producto',
      component: EliminateProductModalComponent,
      data: {
        productId: producto.id
      },
      width: '500px',
      closable: true,
      closeOnBackdrop: false
    });
  }

  ngAfterViewInit(): void {
    // Pequeño delay por si el render depende del loading
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    });
  }

}
