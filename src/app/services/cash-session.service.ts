import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { CashSession } from "../models/cash-session";
import { CalendarService } from "./calendar.service";

@Injectable({ providedIn: 'root' })
export class CashSessionService {
  private mockData$ = new BehaviorSubject<CashSession[]>([]);
  private initialized = false;

  constructor(
    private calendarService: CalendarService,
    private http: HttpClient
  ) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.cashSession;
  }

  private initMock() {
    if (this.initialized) return;
    this.http
      .get<CashSession[]>('assets/mock/cash_session.json')
      .subscribe(data => {
        this.mockData$.next(data);
        this.initialized = true;
      });
  }

  openCashsession(startAmount: number): Promise<{ id: number }> {
    if (this.hasBackend()) {
      return window.api.cashSession.open(startAmount);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const newSession: CashSession = {
      id: Date.now(),
      start_amount: startAmount,
      current_amount: startAmount,
      opened_at: new Date().toISOString(),
      closed_at: null
    };
    this.mockData$.next([...current, newSession]);
    return Promise.resolve({ id: newSession.id! });
  }

  getOpen(): Promise<CashSession | null> {
    if (this.hasBackend()) {
      return window.api.cashSession.getOpen();
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const open = current.find(s => s.closed_at === null) || null;
    return Promise.resolve(open);
  }

  getAll(): Promise<CashSession[]> {
    if (this.hasBackend()) {
      return window.api.cashSession.getAll();
    }
    // MOCK MODE
    this.initMock();
    return Promise.resolve(this.mockData$.value);
  }

  closeCashSession(id: number, amount: number): Promise<{ closed: number }> {
    if (this.hasBackend()) {
      return window.api.cashSession.close(id, amount);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(s =>
      s.id === id
        ? { ...s, current_amount: amount, closed_at: new Date().toISOString() }
        : s
    );
    this.mockData$.next(updated);
    return Promise.resolve({ closed: 1 });
  }

  closeAllCashSessions(amount: number): Promise<{ closed: number }> {
    if (this.hasBackend()) {
      return window.api.cashSession.closeAll(amount);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    let closedCount = 0;
    const updated = current.map(s => {
      if (s.closed_at === null) {
        closedCount++;
        return { ...s, current_amount: amount, closed_at: new Date().toISOString() };
      }
      return s;
    });
    this.mockData$.next(updated);
    return Promise.resolve({ closed: closedCount });
  }

  updateCurrentAmount(sessionId: number, delta: number): Promise<{ updated: number }> {
    if (this.hasBackend()) {
      return window.api.cashSession.updateCurrentAmount(sessionId, delta);
    }
    // MOCK MODE
    this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(s =>
      s.id === sessionId
        ? { ...s, current_amount: s.current_amount + delta }
        : s
    );
    this.mockData$.next(updated);
    return Promise.resolve({ updated: 1 });
  }

  /**
   * Verifica si una fecha NO es de hoy
   */
  private isNotToday(dateString: string): boolean {
    const sessionDate = new Date(dateString);
    sessionDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessionDate.getTime() !== today.getTime();
  }

  /**
   * Verifica si una fecha ES de hoy
   */
  isToday(dateString: string): boolean {
    return !this.isNotToday(dateString);
  }

  async createNewSession(): Promise<CashSession> {
    const sessions = await this.getAll();
    let lastSession = sessions.length ? sessions[sessions.length - 1] : null;

    // Si existe una sesión abierta
    if (lastSession && lastSession.closed_at === null) {
      // Verificar si NO es de hoy (puede ser de ayer, anteayer, etc.)
      if (lastSession.opened_at && this.isNotToday(lastSession.opened_at)) {
        // Cerrar la sesión automáticamente
        await this.closeCashSession(lastSession.id!, lastSession.current_amount);

        // Refrescar la lista de sesiones después de cerrar
        const refreshedSessions = await this.getAll();
        lastSession = refreshedSessions.length
          ? refreshedSessions[refreshedSessions.length - 1]
          : null;
      }

      // Si aún hay una sesión abierta (de hoy), lanzar error
      if (lastSession && lastSession.closed_at === null) {
        throw new Error(
          'No se puede crear una nueva sesión: existe una sesión abierta de hoy'
        );
      }
    }

    // Crear la nueva sesión con el monto de la última sesión cerrada
    const startAmount = lastSession ? lastSession.current_amount : 0;
    const { id } = await this.openCashsession(startAmount);

    const newSession: CashSession = {
      id,
      start_amount: startAmount,
      current_amount: startAmount,
      opened_at: new Date().toISOString(),
      closed_at: null
    };

    return newSession;
  }
}
