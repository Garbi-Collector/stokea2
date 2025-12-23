import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  getAll() {
    return window.api.products.getAll();
  }

  getById(id: number) {
    return window.api.products.getById(id);
  }

  create(product: any) {
    return window.api.products.create(product);
  }

  update(id: number, product: any) {
    return window.api.products.update(id, product);
  }

  delete(id: number) {
    return window.api.products.delete(id);
  }
}
