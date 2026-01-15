// services/product-excel.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ProductExcelRow, ExcelImportResult, ExcelValidationError } from '../models/product-excel.model';
import { Product } from "../models/product";

@Injectable({ providedIn: 'root' })
export class ProductExcelService {

  // Definición de las columnas esperadas en el Excel
  private readonly EXCEL_COLUMNS = {
    name: 'Nombre',
    description: 'Descripción',
    brand: 'Marca',
    code: 'Código',
    wholesale_price: 'Precio Mayorista',
    profit_percentage: 'Porcentaje Ganancia',
    sale_price: 'Precio Venta',
    stock: 'Stock', // Nueva columna
    min_alert: 'Stock Mínimo' // Nueva columna
  };

  /**
   * Genera un archivo Excel de plantilla con el formato correcto
   */
  generateTemplate(): void {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        [this.EXCEL_COLUMNS.name]: 'Producto Ejemplo',
        [this.EXCEL_COLUMNS.description]: 'Descripción del producto',
        [this.EXCEL_COLUMNS.brand]: 'Marca X',
        [this.EXCEL_COLUMNS.code]: 'PROD001',
        [this.EXCEL_COLUMNS.wholesale_price]: 100,
        [this.EXCEL_COLUMNS.profit_percentage]: 30,
        [this.EXCEL_COLUMNS.sale_price]: 130,
        [this.EXCEL_COLUMNS.stock]: 50,
        [this.EXCEL_COLUMNS.min_alert]: 10
      }
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Descargar el archivo
    XLSX.writeFile(workbook, 'plantilla_productos.xlsx');
  }

  /**
   * Procesa un archivo Excel y valida su contenido
   */
  async processExcelFile(file: File): Promise<ExcelImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Tomar la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validar y procesar
          const result = this.validateAndProcessData(jsonData);
          resolve(result);
        } catch (error) {
          reject(new Error('Error al procesar el archivo Excel: ' + error));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Valida y procesa los datos del Excel
   */
  private validateAndProcessData(data: any[]): ExcelImportResult {
    const validProducts: ProductExcelRow[] = [];
    const errors: ExcelValidationError[] = [];

    // Validar que el archivo no esté vacío
    if (!data || data.length === 0) {
      errors.push({
        row: 0,
        message: 'El archivo Excel está vacío'
      });

      return {
        success: false,
        validProducts: [],
        errors,
        totalRows: 0,
        validRows: 0,
        invalidRows: 0
      };
    }

    // Validar encabezados
    const headerValidation = this.validateHeaders(data[0]);
    if (!headerValidation.valid) {
      errors.push({
        row: 0,
        message: `Formato de Excel inválido. ${headerValidation.message}`
      });

      return {
        success: false,
        validProducts: [],
        errors,
        totalRows: data.length,
        validRows: 0,
        invalidRows: data.length
      };
    }

    // Procesar cada fila
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque Excel empieza en 1 y tiene header
      const rowErrors = this.validateRow(row, rowNumber);

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        const product = this.mapRowToProduct(row);
        validProducts.push(product);
      }
    });

    return {
      success: errors.length === 0,
      validProducts,
      errors,
      totalRows: data.length,
      validRows: validProducts.length,
      invalidRows: errors.filter(e => e.row > 0).length
    };
  }

  /**
   * Valida que los encabezados del Excel sean correctos
   */
  private validateHeaders(firstRow: any): { valid: boolean; message: string } {
    const requiredHeaders = [
      this.EXCEL_COLUMNS.name,
      this.EXCEL_COLUMNS.code,
      this.EXCEL_COLUMNS.wholesale_price,
      this.EXCEL_COLUMNS.profit_percentage,
      this.EXCEL_COLUMNS.sale_price
    ];

    const rowKeys = Object.keys(firstRow);
    const missingHeaders = requiredHeaders.filter(header => !rowKeys.includes(header));

    if (missingHeaders.length > 0) {
      return {
        valid: false,
        message: `Faltan las siguientes columnas: ${missingHeaders.join(', ')}`
      };
    }

    return { valid: true, message: '' };
  }

  /**
   * Valida una fila individual
   */
  private validateRow(row: any, rowNumber: number): ExcelValidationError[] {
    const errors: ExcelValidationError[] = [];

    // Validar nombre (requerido)
    if (!row[this.EXCEL_COLUMNS.name] || String(row[this.EXCEL_COLUMNS.name]).trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'El nombre es requerido',
        data: row
      });
    }

    // Validar código (requerido)
    if (!row[this.EXCEL_COLUMNS.code] || String(row[this.EXCEL_COLUMNS.code]).trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: 'El código es requerido',
        data: row
      });
    }

    // Validar precio mayorista (requerido y numérico)
    if (!this.isValidNumber(row[this.EXCEL_COLUMNS.wholesale_price])) {
      errors.push({
        row: rowNumber,
        field: 'wholesale_price',
        message: 'El precio mayorista debe ser un número válido',
        data: row
      });
    } else if (Number(row[this.EXCEL_COLUMNS.wholesale_price]) < 0) {
      errors.push({
        row: rowNumber,
        field: 'wholesale_price',
        message: 'El precio mayorista no puede ser negativo',
        data: row
      });
    }

    // Validar porcentaje de ganancia (requerido y numérico)
    if (!this.isValidNumber(row[this.EXCEL_COLUMNS.profit_percentage])) {
      errors.push({
        row: rowNumber,
        field: 'profit_percentage',
        message: 'El porcentaje de ganancia debe ser un número válido',
        data: row
      });
    } else if (Number(row[this.EXCEL_COLUMNS.profit_percentage]) < 0) {
      errors.push({
        row: rowNumber,
        field: 'profit_percentage',
        message: 'El porcentaje de ganancia no puede ser negativo',
        data: row
      });
    }

    // Validar precio de venta (requerido y numérico)
    if (!this.isValidNumber(row[this.EXCEL_COLUMNS.sale_price])) {
      errors.push({
        row: rowNumber,
        field: 'sale_price',
        message: 'El precio de venta debe ser un número válido',
        data: row
      });
    } else if (Number(row[this.EXCEL_COLUMNS.sale_price]) < 0) {
      errors.push({
        row: rowNumber,
        field: 'sale_price',
        message: 'El precio de venta no puede ser negativo',
        data: row
      });
    }

    // Validar stock (opcional pero debe ser numérico si existe)
    if (row[this.EXCEL_COLUMNS.stock] !== undefined &&
      row[this.EXCEL_COLUMNS.stock] !== null &&
      row[this.EXCEL_COLUMNS.stock] !== '') {
      if (!this.isValidNumber(row[this.EXCEL_COLUMNS.stock])) {
        errors.push({
          row: rowNumber,
          field: 'stock',
          message: 'El stock debe ser un número válido',
          data: row
        });
      } else if (Number(row[this.EXCEL_COLUMNS.stock]) < 0) {
        errors.push({
          row: rowNumber,
          field: 'stock',
          message: 'El stock no puede ser negativo',
          data: row
        });
      } else if (!Number.isInteger(Number(row[this.EXCEL_COLUMNS.stock]))) {
        errors.push({
          row: rowNumber,
          field: 'stock',
          message: 'El stock debe ser un número entero',
          data: row
        });
      }
    }

    // Validar stock mínimo (opcional pero debe ser numérico si existe)
    if (row[this.EXCEL_COLUMNS.min_alert] !== undefined &&
      row[this.EXCEL_COLUMNS.min_alert] !== null &&
      row[this.EXCEL_COLUMNS.min_alert] !== '') {
      if (!this.isValidNumber(row[this.EXCEL_COLUMNS.min_alert])) {
        errors.push({
          row: rowNumber,
          field: 'min_alert',
          message: 'El stock mínimo debe ser un número válido',
          data: row
        });
      } else if (Number(row[this.EXCEL_COLUMNS.min_alert]) < 0) {
        errors.push({
          row: rowNumber,
          field: 'min_alert',
          message: 'El stock mínimo no puede ser negativo',
          data: row
        });
      } else if (!Number.isInteger(Number(row[this.EXCEL_COLUMNS.min_alert]))) {
        errors.push({
          row: rowNumber,
          field: 'min_alert',
          message: 'El stock mínimo debe ser un número entero',
          data: row
        });
      }
    }

    return errors;
  }

  /**
   * Verifica si un valor es un número válido
   */
  private isValidNumber(value: any): boolean {
    return value !== null &&
      value !== undefined &&
      value !== '' &&
      !isNaN(Number(value));
  }

  /**
   * Mapea una fila del Excel a un objeto ProductExcelRow
   */
  private mapRowToProduct(row: any): ProductExcelRow {
    const product: ProductExcelRow = {
      name: String(row[this.EXCEL_COLUMNS.name]).trim(),
      description: row[this.EXCEL_COLUMNS.description]
        ? String(row[this.EXCEL_COLUMNS.description]).trim()
        : undefined,
      brand: row[this.EXCEL_COLUMNS.brand]
        ? String(row[this.EXCEL_COLUMNS.brand]).trim()
        : undefined,
      code: String(row[this.EXCEL_COLUMNS.code]).trim(),
      wholesale_price: Number(row[this.EXCEL_COLUMNS.wholesale_price]),
      profit_percentage: Number(row[this.EXCEL_COLUMNS.profit_percentage]),
      sale_price: Number(row[this.EXCEL_COLUMNS.sale_price])
    };

    // Agregar stock si existe
    if (this.isValidNumber(row[this.EXCEL_COLUMNS.stock])) {
      product.stock = Math.floor(Number(row[this.EXCEL_COLUMNS.stock]));
    }

    // Agregar stock mínimo si existe
    if (this.isValidNumber(row[this.EXCEL_COLUMNS.min_alert])) {
      product.min_alert = Math.floor(Number(row[this.EXCEL_COLUMNS.min_alert]));
    }

    return product;
  }

  /**
   * Convierte ProductExcelRow a Product para guardar en la BD
   */
  convertToProduct(excelProduct: ProductExcelRow): Omit<Product, 'id' | 'created_at'> {
    return {
      name: excelProduct.name,
      description: excelProduct.description,
      brand: excelProduct.brand,
      code: excelProduct.code,
      wholesale_price: excelProduct.wholesale_price,
      profit_percentage: excelProduct.profit_percentage,
      sale_price: excelProduct.sale_price
    };
  }
}
