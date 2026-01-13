export interface CalendarDay {
  date: Date;
  dayNumber: number;
  month: number;
  monthName: string;
  dayName: string;
  isCurrentMonth: boolean;
  status?: string; // se completa después (ventas, cerrado, etc)
}
