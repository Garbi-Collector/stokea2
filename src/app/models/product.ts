export interface Product {
  id?: number;               // AUTOINCREMENT
  name: string;
  description?: string;
  brand?: string;
  code: string;
  wholesale_price: number;
  profit_percentage: number;
  sale_price: number;
  created_at?: string;
}
