export {};

declare global {
  interface Window {
    api: {

      products: {
        getAll(): Promise<any[]>;
        getById(id: number): Promise<any>;
        create(product: any): Promise<{ id: number }>;
        update(id: number, product: any): Promise<{ changes: number }>;
        delete(id: number): Promise<{ deleted: number }>;
      };

      stock: {
        getAll(): Promise<any[]>;
        getByProduct(productId: number): Promise<any>;
        create(stock: any): Promise<{ id: number }>;
        update(id: number, stock: any): Promise<{ changes: number }>;
      };

      cashSession: {
        open(startAmount: number): Promise<{ id: number }>;
        getOpen(): Promise<any>;
        close(id: number, amount: number): Promise<{ closed: number }>;
      };

      cashMovements: {
        create(movement: any): Promise<{ id: number }>;
        getBySession(sessionId: number): Promise<any[]>;
      };

      sales: {
        create(sale: any): Promise<{ id: number }>;
      };

      saleItems: {
        create(item: any): Promise<{ id: number }>;
      };
    };
  }
}
