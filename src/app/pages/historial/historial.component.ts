import { Component, OnInit, HostListener } from '@angular/core';
import {CommonModule, NgClass, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {CashMovement} from "../../models/cash-movement";
import {CashSession} from "../../models/cash-session";
import {CashSessionService} from "../../services/cash-session.service";
import {CashMovementsService} from "../../services/cash-movements.service";

interface MovementWithSession extends CashMovement {
  session?: CashSession;
}

interface DayGroup {
  date: Date;
  dateString: string;
  dayLabel: string;
  movements: MovementWithSession[];
  totalIn: number;
  totalOut: number;
  totalSale: number;
}

interface Filters {
  searchText: string;
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  amountMin: number | null;
  amountMax: number | null;
  type: 'ALL' | 'IN' | 'OUT' | 'SALE';
}
@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './historial.component.html',
  styleUrls:[
    './historial.component.css',
    './../../style/animations.css',
    './../../style/badges.css',
    './../../style/buttons.css',
    './../../style/cards.css',
    './../../style/colors.css',
    './../../style/forms.css',
    './../../style/tables.css',
    './../../style/typography.css'
    ]
})
export class HistorialComponent implements OnInit {
  dayGroups: DayGroup[] = [];
  filteredDayGroups: DayGroup[] = [];
  currentStickyDay: string = '';

  filters: Filters = {
    searchText: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    amountMin: null,
    amountMax: null,
    type: 'ALL'
  };

  showFilters = false;
  isLoading = true;

  constructor(
    private sessionService: CashSessionService,
    private movementsService: CashMovementsService
  ) {}

  async ngOnInit() {
    await this.loadAllData();
  }

  async loadAllData() {
    this.isLoading = true;
    try {
      const sessions = await this.sessionService.getAll();
      const allMovements: MovementWithSession[] = [];

      for (const session of sessions) {
        const movements = await this.movementsService.getBySession(session.id!);
        movements?.forEach(m => {
          allMovements.push({ ...m, session });
        });
      }

      this.groupMovementsByDay(allMovements);
      this.applyFilters();
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  groupMovementsByDay(movements: MovementWithSession[]) {
    const grouped = new Map<string, MovementWithSession[]>();

    movements.forEach(movement => {
      const date = new Date(movement.created_at!);
      const dayKey = format(date, 'yyyy-MM-dd');

      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey)!.push(movement);
    });

    this.dayGroups = Array.from(grouped.entries())
      .map(([dateString, movements]) => {
        const date = new Date(dateString);
        return {
          date,
          dateString,
          dayLabel: this.formatDayLabel(date),
          movements: movements.sort((a, b) =>
            new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
          ),
          totalIn: movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0),
          totalOut: movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0),
          totalSale: movements.filter(m => m.type === 'SALE').reduce((sum, m) => sum + m.amount, 0)
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  formatDayLabel(date: Date): string {
    return format(date, "EEEE, d 'de' MMMM, yyyy", { locale: es });
  }

  applyFilters() {
    this.filteredDayGroups = this.dayGroups
      .map(group => {
        const filtered = group.movements.filter(m => this.matchesFilters(m));

        if (filtered.length === 0) return null;

        return {
          ...group,
          movements: filtered,
          totalIn: filtered.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0),
          totalOut: filtered.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0),
          totalSale: filtered.filter(m => m.type === 'SALE').reduce((sum, m) => sum + m.amount, 0)
        };
      })
      .filter(g => g !== null) as DayGroup[];

    this.updateStickyHeader();
  }

  matchesFilters(movement: MovementWithSession): boolean {
    // Filtro de texto
    if (this.filters.searchText) {
      const search = this.filters.searchText.toLowerCase();
      if (!movement.description?.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Filtro de tipo
    if (this.filters.type !== 'ALL' && movement.type !== this.filters.type) {
      return false;
    }

    // Filtro de monto
    if (this.filters.amountMin !== null && movement.amount < this.filters.amountMin) {
      return false;
    }
    if (this.filters.amountMax !== null && movement.amount > this.filters.amountMax) {
      return false;
    }

    // Filtro de fecha y hora
    const movementDate = new Date(movement.created_at!);

    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      if (this.filters.timeFrom) {
        const [hours, minutes] = this.filters.timeFrom.split(':');
        fromDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        fromDate.setHours(0, 0, 0, 0);
      }
      if (movementDate < fromDate) return false;
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      if (this.filters.timeTo) {
        const [hours, minutes] = this.filters.timeTo.split(':');
        toDate.setHours(parseInt(hours), parseInt(minutes), 59, 999);
      } else {
        toDate.setHours(23, 59, 59, 999);
      }
      if (movementDate > toDate) return false;
    }

    return true;
  }

  clearFilters() {
    this.filters = {
      searchText: '',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      amountMin: null,
      amountMax: null,
      type: 'ALL'
    };
    this.applyFilters();
  }

  getMovementTitle(type: string): string {
    switch (type) {
      case 'IN': return 'Entrada de dinero';
      case 'OUT': return 'Salida de dinero';
      case 'SALE': return 'Venta';
      default: return '';
    }
  }

  getMovementClass(type: string): string {
    switch (type) {
      case 'IN': return 'movement-in';
      case 'OUT': return 'movement-out';
      case 'SALE': return 'movement-sale';
      default: return '';
    }
  }

  formatTime(dateString: string): string {
    return format(new Date(dateString), 'HH:mm');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.updateStickyHeader();
  }

  updateStickyHeader() {
    const scrollPosition = window.scrollY + 200;

    for (const group of this.filteredDayGroups) {
      const element = document.getElementById(`day-${group.dateString}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = elementTop + rect.height;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          this.currentStickyDay = group.dayLabel;
          return;
        }
      }
    }
  }
}
