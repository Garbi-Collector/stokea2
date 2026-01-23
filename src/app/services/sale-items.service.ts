import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SaleItemsService {
  private mockData$ = new BehaviorSubject<any[]>([]);
  private initialized = false;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.saleItems;
  }

  private initMock() {
    if (this.initialized) return;
    this.http.get<any[]>('assets/mock/sale_items.json').subscribe(data => {
      this.mockData$.next(data);
      this.initialized = true;
    });
  }

  create(item: any): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.saleItems.create(item);
    }
    this.initMock();
    const current = this.mockData$.value;
    const newItem = { ...item, id: Date.now() };
    this.mockData$.next([...current, newItem]);
    return Promise.resolve({ id: newItem.id });
  }

  getById(id: number): Promise<any | null> {
    if (this.hasBackend()) {
      return window.api.saleItems.getById(id);
    }
    this.initMock();
    const found = this.mockData$.value.find(i => i.id === id) || null;
    return Promise.resolve(found);
  }

  getBySale(saleId: number): Promise<any[]> {
    if (this.hasBackend()) {
      return window.api.saleItems.getBySale(saleId);
    }
    this.initMock();
    const items = this.mockData$.value.filter(i => i.sale_id === saleId);
    return Promise.resolve(items);
  }

  update(id: number, item: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.saleItems.update(id, item);
    }
    this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(i =>
      i.id === id ? { ...i, ...item } : i
    );
    this.mockData$.next(updated);
    return Promise.resolve({ changes: 1 });
  }
}
