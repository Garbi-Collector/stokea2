import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SalesService {

  create(sale: any) {
    return window.api.sales.create(sale);
  }
}
