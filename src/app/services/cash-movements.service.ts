import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, of , from} from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class CashMovementsService {

  private mockData$ = new BehaviorSubject<any[]>([]);
  private initialized = false;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.cashMovements;
  }

  private initMock() {
    if (this.initialized) return;
    this.http
      .get<any[]>('assets/mock/cash_movements.json')
      .subscribe(data => {
        this.mockData$.next(data);
        this.initialized = true;
      });
  }

  create(movement: any): Observable<any> {
    if (this.hasBackend()) {
      return from(window.api.cashMovements.create(movement));
    }

    this.initMock();
    const current = this.mockData$.value;
    const newMovement = { ...movement, id: Date.now() };
    this.mockData$.next([...current, newMovement]);
    return of(newMovement);
  }


  getBySession(sessionId: number): Observable<any[]> {
    if (this.hasBackend()) {
      return from(window.api.cashMovements.getBySession(sessionId));
    }

    this.initMock();
    return this.mockData$.asObservable().pipe(
      map(data => data.filter(m => m.sessionId === sessionId))
    );
  }


  getById(id: number): Observable<any | null> {
    if (this.hasBackend()) {
      return from(window.api.cashMovements.getById(id));
    }

    this.initMock();
    const found = this.mockData$.value.find(m => m.id === id) || null;
    return of(found);
  }


  update(id: number, movement: any): Observable<{ changes: number }> {
    if (this.hasBackend()) {
      return from(window.api.cashMovements.update(id, movement));
    }

    this.initMock();
    const current = this.mockData$.value;
    const updated = current.map(m =>
      m.id === id ? { ...m, ...movement } : m
    );
    this.mockData$.next(updated);

    return of({ changes: 1 });
  }

}
