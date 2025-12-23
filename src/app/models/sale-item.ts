export interface SaleItem {
  id?: number;
  sale_id: number;     // FK → sales.id
  product_id: number;  // FK → products.id
  quantity: number;
  unit_price: number;
  subtotal: number;
}
