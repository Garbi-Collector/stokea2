export interface User {
  id: number;

  name: string;
  is_first_time: boolean;

  open_hour: number;
  open_minute: number;
  close_hour: number;
  close_minute: number;

  money_goal: number;

  created_at?: string;
}
