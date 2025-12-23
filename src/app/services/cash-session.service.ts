import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CashSessionService {

  open(startAmount: number) {
    return window.api.cashSession.open(startAmount);
  }

  getOpen() {
    return window.api.cashSession.getOpen();
  }

  close(id: number, amount: number) {
    return window.api.cashSession.close(id, amount);
  }
}
