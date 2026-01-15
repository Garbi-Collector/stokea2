// product-import-modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../modalconfigs/core/modal.service';
import { ExcelImportResult, ExcelValidationError } from '../../models/product-excel.model';
import { ProductExcelService } from "../../services/ProductExcelService";
import { ProductsService } from "../../services/products.service";
import { StockService } from "../../services/stock.service"; // Importar StockService
import { Product } from "../../models/product";
import { Stock } from "../../models/stock"; // Importar el modelo Stock

@Component({
  selector: 'app-product-import-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-import-modal.component.html',
  styleUrl: './product-import-modal.component.css'
})
export class ProductImportModalComponent {
  selectedFile: File | null = null;
  isDragging: boolean = false;
  isProcessing: boolean = false;
  importResult: ExcelImportResult | null = null;
  showResults: boolean = false;
  isSaving: boolean = false;

  constructor(
    private modalService: ModalService,
    private excelService: ProductExcelService,
    private productsService: ProductsService,
    private stockService: StockService // Inyectar StockService
  ) {}

  downloadTemplate(): void {
    this.excelService.generateTemplate();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
      return;
    }

    this.selectedFile = file;
    this.showResults = false;
    this.importResult = null;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.showResults = false;
    this.importResult = null;
  }

  async processFile(): Promise<void> {
    if (!this.selectedFile) return;

    this.isProcessing = true;

    try {
      this.importResult = await this.excelService.processExcelFile(this.selectedFile);
      this.showResults = true;
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      alert('Error al procesar el archivo. Por favor verifica que el formato sea correcto.');
    } finally {
      this.isProcessing = false;
    }
  }

  async confirmImport(): Promise<void> {
    if (!this.importResult || this.importResult.validProducts.length === 0) {
      return;
    }

    this.isSaving = true;

    try {
      // Convertir los productos del Excel al formato de la base de datos
      const productsToSave: Omit<Product, 'id' | 'created_at'>[] =
        this.importResult.validProducts.map(excelProduct =>
          this.excelService.convertToProduct(excelProduct)
        );

      // Guardar todos los productos en la base de datos
      await this.productsService.createMany(productsToSave as Product[]);

      console.log(`${productsToSave.length} productos importados exitosamente`);

      // Obtener todos los productos recién creados por sus códigos
      // (asumiendo que los códigos son únicos)
      const allProducts = await this.productsService.getAll();

      // Crear un mapa de código -> producto para búsqueda rápida
      const productsByCode = new Map(
        allProducts.map((p: Product) => [p.code, p])
      );

      // Crear registros de stock para los productos que tienen información de stock
      const stockPromises = this.importResult.validProducts
        .map((excelProduct) => {
          // Solo crear stock si se proporcionó cantidad de stock
          if (excelProduct.stock !== undefined && excelProduct.stock !== null) {
            const product = productsByCode.get(excelProduct.code);

            if (product && product.id) {
              const stockData: Omit<Stock, 'id'> = {
                product_id: product.id,
                quantity: excelProduct.stock,
                min_alert: excelProduct.min_alert
              };

              return this.stockService.create(stockData);
            }
          }
          return null;
        })
        .filter(promise => promise !== null);

      // Esperar a que se creen todos los registros de stock
      if (stockPromises.length > 0) {
        await Promise.all(stockPromises);
        console.log(`${stockPromises.length} registros de stock creados exitosamente`);
      }

      // Cerrar el modal con éxito
      this.modalService.close(true);
    } catch (error) {
      console.error('Error al guardar los productos:', error);
      alert('Error al guardar los productos en la base de datos. Por favor intenta de nuevo.');
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.modalService.close(false);
  }

  getFileSize(): string {
    if (!this.selectedFile) return '';
    const sizeInKB = this.selectedFile.size / 1024;
    return sizeInKB < 1024
      ? `${sizeInKB.toFixed(2)} KB`
      : `${(sizeInKB / 1024).toFixed(2)} MB`;
  }

  getErrorsByField(field: string): ExcelValidationError[] {
    if (!this.importResult) return [];
    return this.importResult.errors.filter(error => error.field === field);
  }

  hasErrors(): boolean {
    return this.importResult ? this.importResult.errors.length > 0 : false;
  }
}
