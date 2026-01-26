import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SaleItemsService {
  private mockData$ = new BehaviorSubject<any[]>([]);
  private initPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.saleItems;
  }

  private async initMock(): Promise<void> {
    // Si ya se está inicializando o ya está inicializado, esperar/retornar
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const data = await firstValueFrom(
        this.http.get<any[]>('assets/mock/sale_items.json')
      );
      this.mockData$.next(data);
    })();

    return this.initPromise;
  }

  async create(item: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.saleItems.create(item);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const newItem = { ...item, id: Date.now() };
    this.mockData$.next([...current, newItem]);
    return { id: newItem.id };
  }

  async getById(id: number): Promise<any | null> {
    if (this.hasBackend()) {
      return window.api.saleItems.getById(id);
    }
    // MOCK MODE
    await this.initMock();
    return this.mockData$.value.find(i => i.id === id) || null;
  }

  async getBySale(saleId: number): Promise<any[]> {
    if (this.hasBackend()) {
      return window.api.saleItems.getBySale(saleId);
    }
    // MOCK MODE
    await this.initMock();
    return this.mockData$.value.filter(i => i.sale_id === saleId);
  }

  async update(id: number, item: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.saleItems.update(id, item);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(i =>
      i.id === id ? { ...i, ...item } : i
    );
    this.mockData$.next(updated);
    return { changes: 1 };
  }
}
