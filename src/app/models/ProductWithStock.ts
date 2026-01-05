export interface ProductWithStock {
  id: number;
  cantidad: number;
  nombre: string;
  descripcion: string;
  marca: string;
  codigo: string;
  precioMayorista: number;
  precioMinorista: number;
  created_at: string;
  stockId?: number;
  minAlert?: number;
}
