import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class InicioComponent implements OnInit {
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

  moneyGoal :number = 0;

  constructor(
    private userService: UserService,
    private modalService: ModalService,
    private productService: ProductsService,
    private calendarService: CalendarService,
    private cashSessionService: CashSessionService
  ) {}

  async ngOnInit(): Promise<void> {
    this.hasVisited = await this.userService.hasVisited();
    if (!this.hasVisited) {
      this.abrirModalSetUp();
    }
    this.name = await this.userService.getUserName();
    this.totalProducts = await this.totalProductsCount();
    this.hasProduct = this.totalProducts > 0;

    // Intentar crear/obtener sesión de caja
    await this.initializeCashSession();

    this.loadCashAmount();
    this.loadMoneyGoal();

    // Inicializar calendario con estados
    await this.initCalendar();
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

    // Aplicar estados a los días del calendario
    await this.applyCalendarStates();
  }

  /**
   * Aplica los estados (colores) a cada día del calendario basándose en las sesiones
   */
  async applyCalendarStates(): Promise<void> {
    try {
      // Obtener todas las sesiones
      const allSessions = await this.cashSessionService.getAll();

      // Normalizar la fecha de hoy para comparaciones
      const todayNormalized = new Date(this.today);
      todayNormalized.setHours(0, 0, 0, 0);

      // Procesar cada día del calendario
      this.calendarDays = this.calendarDays.map(day => {
        const dayNormalized = new Date(day.date);
        dayNormalized.setHours(0, 0, 0, 0);

        // Si es el día de hoy, mantener el estado actual
        if (dayNormalized.getTime() === todayNormalized.getTime()) {
          return { ...day, status: 'today' };
        }

        // Si es un día futuro
        if (dayNormalized > todayNormalized) {
          return { ...day, status: 'future' };
        }

        // Es un día pasado - buscar si tiene sesión
        const sessionForDay = this.findSessionForDate(allSessions, dayNormalized);

        if (!sessionForDay) {
          // Día pasado sin sesión
          return { ...day, status: 'past-no-session' };
        }

        // Día pasado con sesión - calcular ventas
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

  /**
   * Encuentra la sesión que corresponde a una fecha específica
   */
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

  /**
   * Determina las clases CSS para cada día del calendario
   */
  getDayClasses(day: CalendarDay): string {
    const classes: string[] = ['calendar-day'];

    if (this.isToday(day)) {
      classes.push('today');
    }

    if (!day.isCurrentMonth) {
      classes.push('other-month');
    }

    // Agregar clase según el estado
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

    // Suscribirse al cierre del modal para actualizar datos
    const closeSub = this.modalService.close$.subscribe((success) => {
      if (success) {
        // Recargar el monto de la caja o actualizar datos necesarios
        this.loadCashAmount();
      }
      closeSub.unsubscribe();
    });
  }

  handleEgreso(): void {
    this.modalService.open({
      title: 'Registrar Egreso',
      component: TransactionModalComponent,
      data: {
        type: 'egreso'
      },
      width: '500px',
      closable: true,
      closeOnBackdrop: true
    });

    // Suscribirse al cierre del modal para actualizar datos
    const closeSub = this.modalService.close$.subscribe((success) => {
      if (success) {
        // Recargar el monto de la caja o actualizar datos necesarios
        this.loadCashAmount();
      }
      closeSub.unsubscribe();
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
    /*// Suscribirse al cierre del modal para actualizar datos
    const closeSub = this.modalService.close$.subscribe((success) => {
      if (success) {
        // Recargar el monto de la caja o actualizar datos necesarios
        this.loadCashAmount();
      }
      closeSub.unsubscribe();
    });*/
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
