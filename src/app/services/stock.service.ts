import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StockService {
  private mockData$ = new BehaviorSubject<any[]>([]);
  private initPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.stock;
  }

  private async initMock(): Promise<void> {
    // Si ya se está inicializando o ya está inicializado, esperar/retornar
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const data = await firstValueFrom(
        this.http.get<any[]>('assets/mock/stock.json')
      );
      this.mockData$.next(data);
    })();

    return this.initPromise;
  }

  async getAll(): Promise<any[]> {
    if (this.hasBackend()) {
      return window.api.stock.getAll();
    }
    // MOCK MODE
    await this.initMock();
    return this.mockData$.value;
  }

  async getByProduct(productId: number): Promise<any | null> {
    if (this.hasBackend()) {
      return window.api.stock.getByProduct(productId);
    }
    // MOCK MODE
    await this.initMock();
    return this.mockData$.value.find(s => s.product_id === productId) || null;
  }

  async create(stock: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.stock.create(stock);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const newStock = {
      ...stock,
      id: Date.now()
    };
    this.mockData$.next([...current, newStock]);
    return { id: newStock.id };
  }

  async update(id: number, stock: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.stock.update(id, stock);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(s =>
      s.id === id ? { ...s, ...stock, id } : s
    );
    this.mockData$.next(updated);
    return { changes: 1 };
  }

  async deleteByProduct(productId: number): Promise<{ deleted: number }> {
    if (this.hasBackend()) {
      return window.api.stock.deleteByProduct(productId);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const filtered = current.filter(s => s.product_id !== productId);
    this.mockData$.next(filtered);
    return { deleted: 1 };
  }
}
