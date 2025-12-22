export {};

declare global {
  interface Window {
    api: {
      products: {
        getAll(): Promise<any[]>;
        create(product: any): Promise<{ id: number }>;
        update(id: number, product: any): Promise<{ changes: number }>;
        delete(id: number): Promise<{ deleted: number }>;
      };
    };
  }
}
