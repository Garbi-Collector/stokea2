import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StockService {

  getAll() {
    return window.api.stock.getAll();
  }

  getByProduct(productId: number) {
    return window.api.stock.getByProduct(productId);
  }

  create(stock: any) {
    return window.api.stock.create(stock);
  }

  update(id: number, stock: any) {
    return window.api.stock.update(id, stock);
  }
  deleteByProduct(productId: number) {
    return window.api.stock.deleteByProduct(productId);
  }

}
