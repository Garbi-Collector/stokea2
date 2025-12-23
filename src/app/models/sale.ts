export interface Sale {
  id?: number;
  cash_session_id: number; // FK → cash_session.id
  total: number;
  created_at?: string;
}
