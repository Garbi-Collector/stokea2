export interface CalendarDay {
  date: Date;
  dayNumber: number;
  month: number;
  monthName: string;
  dayName: string;
  isCurrentMonth: boolean;
  status?: 'past-no-session' | 'past-low' | 'past-high' | 'today' | 'future'; // Estados posibles
}
