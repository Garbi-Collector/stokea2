export type CashMovementType = 'IN' | 'OUT';

export interface CashMovement {
  id?: number;
  cash_session_id: number; // FK → cash_session.id
  type: CashMovementType;
  amount: number;
  description?: string;
  created_at?: string;
}
