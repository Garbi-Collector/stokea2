import {Injectable} from "@angular/core";
import {BehaviorSubject, map, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";

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
      return (window as any).api.cashMovements.create(movement);
    }

    // MOCK MODE
    this.initMock();

    const current = this.mockData$.value;
    const newMovement = {
      ...movement,
      id: Date.now()
    };

    this.mockData$.next([...current, newMovement]);
    return of(newMovement);
  }

  getBySession(sessionId: number): Observable<any[]> {
    if (this.hasBackend()) {
      return (window as any).api.cashMovements.getBySession(sessionId);
    }

    // MOCK MODE
    this.initMock();

    return this.mockData$.asObservable().pipe(
      map(data => data.filter(m => m.sessionId === sessionId))
    );
  }
}
