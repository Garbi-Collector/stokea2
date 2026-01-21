import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from "../models/product";

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private mockData$ = new BehaviorSubject<Product[]>([]);
  private mockStock$ = new BehaviorSubject<any[]>([]);
  private initialized = false;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.products;
  }

  private initMock() {
    if (this.initialized) return;

    this.http.get<Product[]>('assets/mock/products.json').subscribe(data => {
      this.mockData$.next(data);
    });

    this.http.get<any[]>('assets/mock/stock.json').subscribe(data => {
      this.mockStock$.next(data);
      this.initialized = true;
    });
  }

  getAll(): Promise<Product[]> {
    if (this.hasBackend()) {
      return window.api.products.getAll();
    }
    // MOCK MODE
    this.initMock();
    return Promise.resolve(this.mockData$.value);
  }

  getAllWithStock(): Promise<(Product & { quantity: number })[]> {
    if (this.hasBackend()) {
      return window.api.products.getAllWithStock();
    }
    // MOCK MODE
    this.initMock();
    const products = this.mockData$.value;
    const stock = this.mockStock$.value;

    const productsWithStock = products.map(p => {
      const stockItem = stock.find(s => s.product_id === p.id);
      return {
        ...p,
        quantity: stockItem?.quantity || 0
      };
    });

    return Promise.resolve(productsWithStock);
  }

  getById(id: number): Promise<Product | null> {
    if (this.hasBackend()) {
      return window.api.products.getById(id);
    }
    // MOCK MODE
    this.initMock();
    const product = this.mockData$.value.find(p => p.id === id) || null;
    return Promise.resolve(product);
  }

  create(product: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.products.create(product);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const newProduct = {
      ...product,
      id: Date.now()
    };
    this.mockData$.next([...current, newProduct]);
    return Promise.resolve({ id: newProduct.id });
  }

  createMany(products: Product[]): Promise<{ inserted: number }> {
    if (this.hasBackend()) {
      return window.api.products.createMany(products);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const newProducts = products.map((p, i) => ({
      ...p,
      id: Date.now() + i
    }));
    this.mockData$.next([...current, ...newProducts]);
    return Promise.resolve({ inserted: newProducts.length });
  }

  update(id: number, product: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.products.update(id, product);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(p =>
      p.id === id ? { ...p, ...product, id } : p
    );
    this.mockData$.next(updated);
    return Promise.resolve({ changes: 1 });
  }

  delete(id: number): Promise<{ deleted: number }> {
    if (this.hasBackend()) {
      return window.api.products.delete(id);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const filtered = current.filter(p => p.id !== id);
    this.mockData$.next(filtered);
    return Promise.resolve({ deleted: 1 });
  }

  count(): Promise<number> {
    if (this.hasBackend()) {
      return window.api.products.count();
    }
    // MOCK MODE
    this.initMock();
    return Promise.resolve(this.mockData$.value.length);
  }
}
