import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SaleItemsService {

  create(item: any) {
    return window.api.saleItems.create(item);
  }
}
