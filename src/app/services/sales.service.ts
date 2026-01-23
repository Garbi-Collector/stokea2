import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private mockData$ = new BehaviorSubject<any[]>([]);
  private initialized = false;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.sales;
  }

  private initMock() {
    if (this.initialized) return;
    this.http.get<any[]>('assets/mock/sales.json').subscribe(data => {
      this.mockData$.next(data);
      this.initialized = true;
    });
  }

  create(sale: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.sales.create(sale);
    }
    this.initMock();
    const current = this.mockData$.value;
    const newSale = { ...sale, id: Date.now() };
    this.mockData$.next([...current, newSale]);
    return Promise.resolve({ id: newSale.id });
  }

  getById(id: number): Promise<any | null> {
    if (this.hasBackend()) {
      return window.api.sales.getById(id);
    }
    this.initMock();
    const found = this.mockData$.value.find(s => s.id === id) || null;
    return Promise.resolve(found);
  }

  getAll(): Promise<any[]> {
    if (this.hasBackend()) {
      return window.api.sales.getAll();
    }
    this.initMock();
    return Promise.resolve(this.mockData$.value);
  }

  update(id: number, sale: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.sales.update(id, sale);
    }
    this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(s =>
      s.id === id ? { ...s, ...sale } : s
    );
    this.mockData$.next(updated);
    return Promise.resolve({ changes: 1 });
  }
}
