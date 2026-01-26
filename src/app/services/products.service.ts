import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from "../models/product";

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private mockData$ = new BehaviorSubject<Product[]>([]);
  private mockStock$ = new BehaviorSubject<any[]>([]);
  private initPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.products;
  }

  private async initMock(): Promise<void> {
    // Si ya se está inicializando o ya está inicializado, esperar/retornar
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const [products, stock] = await Promise.all([
        firstValueFrom(this.http.get<Product[]>('assets/mock/products.json')),
        firstValueFrom(this.http.get<any[]>('assets/mock/stock.json'))
      ]);

      this.mockData$.next(products);
      this.mockStock$.next(stock);
    })();

    return this.initPromise;
  }

  async getAll(): Promise<Product[]> {
    if (this.hasBackend()) {
      return window.api.products.getAll();
    }
    // MOCK MODE - esperar a que se carguen los datos
    await this.initMock();
    return this.mockData$.value;
  }

  async getAllWithStock(): Promise<(Product & { quantity: number })[]> {
    if (this.hasBackend()) {
      return window.api.products.getAllWithStock();
    }
    // MOCK MODE - esperar a que se carguen los datos
    await this.initMock();
    const products = this.mockData$.value;
    const stock = this.mockStock$.value;

    const productsWithStock = products.map(p => {
      const stockItem = stock.find(s => s.product_id === p.id);
      return {
        ...p,
        quantity: stockItem?.quantity || 0
      };
    });

    return productsWithStock;
  }

  async getById(id: number): Promise<Product | null> {
    if (this.hasBackend()) {
      return window.api.products.getById(id);
    }
    // MOCK MODE
    await this.initMock();
    const product = this.mockData$.value.find(p => p.id === id) || null;
    return product;
  }

  async create(product: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.products.create(product);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const newProduct = {
      ...product,
      id: Date.now()
    };
    this.mockData$.next([...current, newProduct]);
    return { id: newProduct.id };
  }

  async createMany(products: Product[]): Promise<{ inserted: number }> {
    if (this.hasBackend()) {
      return window.api.products.createMany(products);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const newProducts = products.map((p, i) => ({
      ...p,
      id: Date.now() + i
    }));
    this.mockData$.next([...current, ...newProducts]);
    return { inserted: newProducts.length };
  }

  async update(id: number, product: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.products.update(id, product);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(p =>
      p.id === id ? { ...p, ...product, id } : p
    );
    this.mockData$.next(updated);
    return { changes: 1 };
  }

  async delete(id: number): Promise<{ deleted: number }> {
    if (this.hasBackend()) {
      return window.api.products.delete(id);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const filtered = current.filter(p => p.id !== id);
    this.mockData$.next(filtered);
    return { deleted: 1 };
  }

  async count(): Promise<number> {
    if (this.hasBackend()) {
      return window.api.products.count();
    }
    // MOCK MODE
    await this.initMock();
    return this.mockData$.value.length;
  }
}
