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
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const newSale = {
      ...sale,
      id: Date.now()
    };
    this.mockData$.next([...current, newSale]);
    return Promise.resolve({ id: newSale.id });
  }
}
