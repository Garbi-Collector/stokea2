import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CashMovementsService {

  create(movement: any) {
    return window.api.cashMovements.create(movement);
  }

  getBySession(sessionId: number) {
    return window.api.cashMovements.getBySession(sessionId);
  }
}
