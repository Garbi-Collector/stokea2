import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StockService {
  private mockData$ = new BehaviorSubject<any[]>([]);
  private initialized = false;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.stock;
  }

  private initMock() {
    if (this.initialized) return;
    this.http.get<any[]>('assets/mock/stock.json').subscribe(data => {
      this.mockData$.next(data);
      this.initialized = true;
    });
  }

  getAll(): Promise<any[]> {
    if (this.hasBackend()) {
      return window.api.stock.getAll();
    }
    // MOCK MODE
    this.initMock();
    return Promise.resolve(this.mockData$.value);
  }

  getByProduct(productId: number): Promise<any | null> {
    if (this.hasBackend()) {
      return window.api.stock.getByProduct(productId);
    }
    // MOCK MODE
    this.initMock();
    const stock = this.mockData$.value.find(s => s.product_id === productId) || null;
    return Promise.resolve(stock);
  }

  create(stock: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.stock.create(stock);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const newStock = {
      ...stock,
      id: Date.now()
    };
    this.mockData$.next([...current, newStock]);
    return Promise.resolve({ id: newStock.id });
  }

  update(id: number, stock: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.stock.update(id, stock);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(s =>
      s.id === id ? { ...s, ...stock, id } : s
    );
    this.mockData$.next(updated);
    return Promise.resolve({ changes: 1 });
  }

  deleteByProduct(productId: number): Promise<{ deleted: number }> {
    if (this.hasBackend()) {
      return window.api.stock.deleteByProduct(productId);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const filtered = current.filter(s => s.product_id !== productId);
    this.mockData$.next(filtered);
    return Promise.resolve({ deleted: 1 });
  }
}
