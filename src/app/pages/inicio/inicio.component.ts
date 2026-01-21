import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, filter } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ModalService } from "../../modalconfigs/core/modal.service";
import { ModalComponent } from "../../modalconfigs/shared/components/modal/modal.component";
import { SetupModalComponent } from "../../modals/setup-modal/setup-modal.component";
import { TransactionModalComponent } from "../../modals/transaction-modal/transaction-modal.component";
import { ProductsService } from "../../services/products.service";
import { CalendarService } from "../../services/calendar.service";
import { CalendarDay } from "../../models/CalendarDay";
import { CashSessionService } from "../../services/cash-session.service";
import { CashSession } from "../../models/cash-session";
import {Router} from "@angular/router";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './inicio.component.html',
  styleUrls: [
    './inicio.component.css',
    './../../style/animations.css',
    './../../style/badges.css',
    './../../style/buttons.css',
    './../../style/cards.css',
    './../../style/colors.css',
    './../../style/forms.css',
    './../../style/tables.css',
    './../../style/typography.css',
  ]
})
export class InicioComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private setupModalId: string | null = null;

  totalProducts: number = 0;
  hasProduct: boolean = true;
  name: string | null = "";
  hasVisited = false;

  // Propiedades para la caja
  cashAmount: number = 0;
  totalCashAmount: number = 0;
  isCashVisible: boolean = true;
  currentSession: CashSession | null = null;

  // Propiedades para el calendario
  calendarDays: CalendarDay[] = [];
  currentMonth: string = '';
  currentYear: number = 0;
  today: Date = new Date();
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  moneyGoal: number = 0;

  constructor(
    private userService: UserService,
    private modalService: ModalService,
    private productService: ProductsService,
    private calendarService: CalendarService,
    private cashSessionService: CashSessionService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.inicializarComponente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * MÉTODO PRINCIPAL: Inicializa/Recarga TODO el componente
   * Este método simula un "refresh" completo sin recargar la página
   */
  private async inicializarComponente(): Promise<void> {
    try {
      // 1. Verificar si es la primera visita
      this.hasVisited = await this.userService.hasVisited();

      if (!this.hasVisited) {
        // Si es primera visita, abrir setup y esperar
        this.abrirModalSetUp();
        return;
      }

      // 2. Cargar nombre de usuario
      this.name = await this.userService.getUserName();

      // 3. Cargar productos
      this.totalProducts = await this.totalProductsCount();
      this.hasProduct = this.totalProducts > 0;

      // 4. Inicializar sesión de caja
      await this.initializeCashSession();

      // 5. Cargar montos
      this.loadCashAmount();

      // 6. Cargar objetivo de dinero
      await this.loadMoneyGoal();

      // 7. Inicializar calendario
      await this.initCalendar();

      console.log('Componente inicializado/recargado completamente');
    } catch (error) {
      console.error('Error al inicializar componente:', error);
    }
  }

  async loadMoneyGoal(): Promise<void> {
    try {
      const moneyGoal = await this.userService.getMoneyGoal();
      if (moneyGoal !== null && moneyGoal !== undefined) {
        this.moneyGoal = moneyGoal;
      }
    } catch (error) {
      console.error('Error cargando money goal:', error);
    }
  }

  async initializeCashSession(): Promise<void> {
    try {
      const openSession = await this.cashSessionService.getOpen();

      if (openSession) {
        this.currentSession = openSession;
        this.cashAmount = openSession.current_amount;
        this.totalCashAmount = openSession.current_amount + openSession.start_amount;
      } else {
        this.currentSession = await this.cashSessionService.createNewSession();
        this.cashAmount = this.currentSession.current_amount;
        console.log('Nueva sesión de caja creada:', this.currentSession);
      }
    } catch (error) {
      console.error('Error al inicializar sesión de caja:', error);
    }
  }

  async initCalendar(): Promise<void> {
    this.today = this.calendarService.getToday();
    this.currentYear = this.today.getFullYear();
    const currentMonthIndex = this.today.getMonth();
    this.calendarDays = this.calendarService.getMonthDays(this.currentYear, currentMonthIndex);
    this.currentMonth = this.calendarDays[15]?.monthName || '';

    await this.applyCalendarStates();
  }

  async applyCalendarStates(): Promise<void> {
    try {
      const allSessions = await this.cashSessionService.getAll();
      const todayNormalized = new Date(this.today);
      todayNormalized.setHours(0, 0, 0, 0);

      this.calendarDays = this.calendarDays.map(day => {
        const dayNormalized = new Date(day.date);
        dayNormalized.setHours(0, 0, 0, 0);

        if (dayNormalized.getTime() === todayNormalized.getTime()) {
          return { ...day, status: 'today' };
        }

        if (dayNormalized > todayNormalized) {
          return { ...day, status: 'future' };
        }

        const sessionForDay = this.findSessionForDate(allSessions, dayNormalized);

        if (!sessionForDay) {
          return { ...day, status: 'past-no-session' };
        }

        const sales = sessionForDay.current_amount - sessionForDay.start_amount;

        if (sales >= this.moneyGoal) {
          return { ...day, status: 'past-high' };
        } else {
          return { ...day, status: 'past-low' };
        }
      });
    } catch (error) {
      console.error('Error al aplicar estados del calendario:', error);
    }
  }

  private findSessionForDate(sessions: CashSession[], targetDate: Date): CashSession | undefined {
    return sessions.find(session => {
      if (!session.opened_at) return false;

      const sessionDate = new Date(session.opened_at);
      sessionDate.setHours(0, 0, 0, 0);

      return sessionDate.getTime() === targetDate.getTime();
    });
  }

  isToday(day: CalendarDay): boolean {
    return day.date.toDateString() === this.today.toDateString();
  }

  getDayClasses(day: CalendarDay): string {
    const classes: string[] = ['calendar-day'];

    if (this.isToday(day)) {
      classes.push('today');
    }

    if (!day.isCurrentMonth) {
      classes.push('other-month');
    }

    if (day.status) {
      classes.push(`status-${day.status}`);
    }

    return classes.join(' ');
  }

  async totalProductsCount(): Promise<number> {
    return await this.productService.count();
  }

  loadCashAmount(): void {
    if (this.currentSession) {
      this.cashAmount = this.currentSession.current_amount;
      return;
    }

    const savedAmount = localStorage.getItem('cashAmount');
    this.cashAmount = savedAmount ? parseFloat(savedAmount) : 0;
  }

  toggleCashVisibility(): void {
    this.isCashVisible = !this.isCashVisible;
  }

  handleIngreso(): void {
    this.modalService.open({
      title: 'Registrar Ingreso',
      component: TransactionModalComponent,
      data: { type: 'ingreso' },
      width: '500px',
      closable: true,
      closeOnBackdrop: true
    });

    // Suscripción para recargar después de cerrar el modal
    this.modalService.close$
      .pipe(
        takeUntil(this.destroy$),
        filter(success => success === true)
      )
      .subscribe(async () => {
        await this.inicializarComponente();
      });
  }

  handleEgreso(): void {
    this.modalService.open({
      title: 'Registrar Egreso',
      component: TransactionModalComponent,
      data: { type: 'egreso' },
      width: '500px',
      closable: true,
      closeOnBackdrop: true
    });

    // Suscripción para recargar después de cerrar el modal
    this.modalService.close$
      .pipe(
        takeUntil(this.destroy$),
        filter(success => success === true)
      )
      .subscribe(async () => {
        await this.inicializarComponente();
      });
  }

  abrirModalSetUp(): void {
    this.modalService.open({
      title: 'Acción Requerida',
      component: SetupModalComponent,
      data: {
        nombre: 'Usuario',
        mensaje: 'Debes completar esta configuración antes de continuar.'
      },
      width: '550px',
      closable: true,
      closeOnBackdrop: false
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
