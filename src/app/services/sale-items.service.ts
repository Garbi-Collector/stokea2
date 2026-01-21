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
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const newItem = {
      ...item,
      id: Date.now()
    };
    this.mockData$.next([...current, newItem]);
    return Promise.resolve({ id: newItem.id });
  }
}
