export interface CashSession {
  id?: number;
  start_amount: number;
  current_amount: number;
  opened_at?: string;
  closed_at?: string | null;
}
