import { Injectable } from '@angular/core';
import {Product} from "../models/product";

@Injectable({ providedIn: 'root' })
export class ProductsService {

  getAll() {
    return window.api.products.getAll();
  }
  getAllWithStock() {
    return window.api.products.getAllWithStock();
  }

  getById(id: number) {
    return window.api.products.getById(id);
  }

  create(product: any) {
    return window.api.products.create(product);
  }

  createMany(products: Product[]) {
    return window.api.products.createMany(products);
  }

  update(id: number, product: any) {
    return window.api.products.update(id, product);
  }

  delete(id: number) {
    return window.api.products.delete(id);
  }

  count(): Promise<number> {
    return window.api.products.count();
  }

}
