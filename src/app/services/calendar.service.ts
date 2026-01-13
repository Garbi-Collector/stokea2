import { Injectable } from '@angular/core';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import {CalendarDay} from "../models/CalendarDay";

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  /** Genera calendario mensual completo */
  getMonthDays(year: number, month: number): CalendarDay[] {
    const baseDate = new Date(year, month, 1);

    const start = startOfWeek(startOfMonth(baseDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(baseDate), { weekStartsOn: 0 });

    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      dayNumber: date.getDate(),
      month: date.getMonth(),
      monthName: format(date, 'MMMM', { locale: es }),
      dayName: format(date, 'EEEE', { locale: es }),
      isCurrentMonth: isSameMonth(date, baseDate),
      status: undefined
    }));
  }

  /** Día actual */
  getToday(): Date {
    return new Date();
  }
}
