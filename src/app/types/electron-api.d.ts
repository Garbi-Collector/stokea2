import { Product } from '../models/product.model';
import { Stock } from '../models/stock.model';
import { Sale } from '../models/sale.model';
import { SaleItem } from '../models/sale-item.model';
import { CashSession } from '../models/cash-session.model';
import { CashMovement } from '../models/cash-movement.model';

export {};

declare global {
  interface Window {
    api: {

      /* =======================
         PRODUCTS
      ======================= */
      products: {
        getAll(): Promise<Product[]>;
        getById(id: number): Promise<Product | null>;
        create(product: Product): Promise<{ id: number }>;
        update(id: number, product: Product): Promise<{ changes: number }>;
        delete(id: number): Promise<{ deleted: number }>;
        count(): Promise<number>;
      };

      /* =======================
         STOCK
      ======================= */
      stock: {
        getAll(): Promise<Stock[]>;
        getByProduct(productId: number): Promise<Stock | null>;
        create(stock: Stock): Promise<{ id: number }>;
        update(id: number, stock: Stock): Promise<{ changes: number }>;
        deleteByProduct(productId: number): Promise<{ deleted: number }>;
      };

      /* =======================
         CASH SESSION
      ======================= */
      cashSession: {
        open(startAmount: number): Promise<{ id: number }>;
        getOpen(): Promise<CashSession | null>;
        close(id: number, amount: number): Promise<{ closed: number }>;
      };

      /* =======================
         CASH MOVEMENTS
      ======================= */
      cashMovements: {
        create(movement: CashMovement): Promise<{ id: number }>;
        getBySession(sessionId: number): Promise<CashMovement[]>;
      };

      /* =======================
         SALES
      ======================= */
      sales: {
        create(sale: Sale): Promise<{ id: number }>;
      };

      /* =======================
         SALE ITEMS
      ======================= */
      saleItems: {
        create(item: SaleItem): Promise<{ id: number }>;
      };

      /* =======================
         WINDOW CONTROLS
      ======================= */
      windowControls: {
        minimize(): void;
        maximize(): void;
        close(): void;
      };
    };
  }
}
