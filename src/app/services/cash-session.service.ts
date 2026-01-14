import { Injectable } from "@angular/core";
import { CashSession } from "../models/cash-session";
import { CalendarService } from "./calendar.service";

@Injectable({ providedIn: 'root' })
export class CashSessionService {

  constructor(
    private calendarService: CalendarService
  ) {}

  openCashsession(startAmount: number) {
    return window.api.cashSession.open(startAmount);
  }

  getOpen() {
    return window.api.cashSession.getOpen();
  }

  getAll() {
    return window.api.cashSession.getAll();
  }

  closeCashSession(id: number, amount: number) {
    return window.api.cashSession.close(id, amount);
  }

  closeAllCashSessions(amount: number) {
    return window.api.cashSession.closeAll(amount);
  }

  /**
   * Crea una nueva sesión siguiendo la lógica de negocio
   */
  async createNewSession(): Promise<CashSession> {
    // 1. Obtener todas las sesiones
    const sessions = await this.getAll();

    // 2. Obtener la última sesión (si existe)
    let lastSession = sessions.length
      ? sessions[sessions.length - 1]
      : null;

    // 3. Si existe una sesión abierta
    if (lastSession && lastSession.closed_at === null) {

      // 3.1 Si es de un día anterior, intentar cerrarla
      if (
        lastSession.opened_at &&
        this.calendarService.isPreviousDay(lastSession.opened_at)
      ) {
        await this.closeCashSession(
          lastSession.id!,
          lastSession.current_amount
        );

        // Refrescamos el estado (muy importante)
        const refreshedSessions = await this.getAll();
        lastSession = refreshedSessions.length
          ? refreshedSessions[refreshedSessions.length - 1]
          : null;
      }

      // 3.2 Si sigue abierta, NO se puede crear una nueva
      if (lastSession && lastSession.closed_at === null) {
        throw new Error(
          'No se puede crear una nueva sesión: existe una sesión abierta y no se puede cerrar'
        );
      }
    }

    // 4. Determinar monto inicial
    const startAmount = lastSession
      ? lastSession.current_amount
      : 0;

    // 5. Abrir nueva sesión
    const { id } = await this.openCashsession(startAmount);

    // 6. Construir la nueva sesión
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
