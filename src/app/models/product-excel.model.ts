// models/product-excel.model.ts
export interface ProductExcelRow {
  name: string;
  description?: string;
  brand?: string;
  code: string;
  wholesale_price: number;
  profit_percentage: number;
  sale_price: number;
}

export interface ExcelImportResult {
  success: boolean;
  validProducts: ProductExcelRow[];
  errors: ExcelValidationError[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ExcelValidationError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}
