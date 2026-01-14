export interface User {
  id: 1;
  name: string;
  is_first_time: boolean;

  open_hour: number;
  open_minute: number;
  close_hour: number;
  close_minute: number;

  created_at?: string;
}
