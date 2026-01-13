import {Injectable} from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CashSessionService {

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
}
