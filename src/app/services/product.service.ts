import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  getAll() {
    return window.api.products.getAll();
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
