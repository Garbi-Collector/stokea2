export interface Stock {
  id?: number;
  product_id: number;   // FK → products.id
  quantity: number;
  min_alert?: number;
}
