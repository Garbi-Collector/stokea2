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
        getAll(): Promise<CashSession[]>;
        close(id: number, amount: number): Promise<{ closed: number }>;
        closeAll(amount: number): Promise<{ closed: number }>;
        updateCurrentAmount(
          sessionId: number,
          delta: number
        ): Promise<{ updated: number }>;
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
         USER CONFIG
      ======================= */
      user: {
        get(): Promise<User | null>;
        init(name?: string): Promise<{ created: number }>;
        updateName(name: string): Promise<{ changes: number }>;
        markVisited(): Promise<{ changes: number }>;
        resetFirstVisit(): Promise<{ changes: number }>;

        updateSchedule(
          openHour: number,
          openMinute: number,
          closeHour: number,
          closeMinute: number
        ): Promise<{ changes: number }>;
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
