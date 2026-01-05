export interface ProductForm {
  name: string;
  description: string;
  brand: string;
  code: string;
  wholesale_price: number | null;
  profit_percentage: number | null;
  quantity: number | null;
  min_alert: number | null;
}
