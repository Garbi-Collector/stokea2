import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private mockData$ = new BehaviorSubject<any[]>([]);
  private initPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.sales;
  }

  private async initMock(): Promise<void> {
    // Si ya se está inicializando o ya está inicializado, esperar/retornar
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const data = await firstValueFrom(
        this.http.get<any[]>('assets/mock/sales.json')
      );
      this.mockData$.next(data);
    })();

    return this.initPromise;
  }

  async create(sale: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.sales.create(sale);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const newSale = { ...sale, id: Date.now() };
    this.mockData$.next([...current, newSale]);
    return { id: newSale.id };
  }

  async getById(id: number): Promise<any | null> {
    if (this.hasBackend()) {
      return window.api.sales.getById(id);
    }
    // MOCK MODE
    await this.initMock();
    return this.mockData$.value.find(s => s.id === id) || null;
  }

  async getAll(): Promise<any[]> {
    if (this.hasBackend()) {
      return window.api.sales.getAll();
    }
    // MOCK MODE
    await this.initMock();
    return this.mockData$.value;
  }

  async update(id: number, sale: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.sales.update(id, sale);
    }
    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(s =>
      s.id === id ? { ...s, ...sale } : s
    );
    this.mockData$.next(updated);
    return { changes: 1 };
  }
}
