import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class CashMovementsService {

  private mockData$ = new BehaviorSubject<any[]>([]);
  private initPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.cashMovements;
  }

  private async initMock(): Promise<void> {
    // Si ya se está inicializando o ya está inicializado, esperar/retornar
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const data = await firstValueFrom(
        this.http.get<any[]>('assets/mock/cash_movements.json')
      );
      this.mockData$.next(data);
    })();

    return this.initPromise;
  }

  async create(movement: any): Promise<any> {
    if (this.hasBackend()) {
      return window.api.cashMovements.create(movement);
    }

    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const newMovement = { ...movement, id: Date.now() };
    this.mockData$.next([...current, newMovement]);
    return newMovement;
  }

  async getBySession(sessionId: number): Promise<any[]> {
    if (this.hasBackend()) {
      return window.api.cashMovements.getBySession(sessionId);
    }

    // MOCK MODE
    await this.initMock();
    return this.mockData$.value.filter(m => m.sessionId === sessionId);
  }

  async getById(id: number): Promise<any | null> {
    if (this.hasBackend()) {
      return window.api.cashMovements.getById(id);
    }

    // MOCK MODE
    await this.initMock();
    return this.mockData$.value.find(m => m.id === id) || null;
  }

  async update(id: number, movement: any): Promise<{ changes: number }> {
    if (this.hasBackend()) {
      return window.api.cashMovements.update(id, movement);
    }

    // MOCK MODE
    await this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(m =>
      m.id === id ? { ...m, ...movement } : m
    );
    this.mockData$.next(updated);

    return { changes: 1 };
  }
}
