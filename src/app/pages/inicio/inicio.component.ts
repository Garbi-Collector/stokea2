import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ModalService } from "../../modalconfigs/core/modal.service";
import { ModalComponent } from "../../modalconfigs/shared/components/modal/modal.component";
import { SetupModalComponent } from "../../modals/setup-modal/setup-modal.component";
import { ProductsService } from "../../services/products.service";
import { CashSessionService } from "../../services/cash-session.service";
import {CashSession} from "../../models/cash-session";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  totalProducts: number = 0;
  hasProduct: boolean = true;
  name: string | null = "";
  hasVisited = false;

  // Propiedades para la caja
  cashAmount: number = 0;
  isCashVisible: boolean = true;
  currentSession: CashSession | null = null;

  // Propiedades para el calendario
  allSessions: CashSession[] = [];
  calendarDays: CalendarDay[] = [];

  constructor(
    private storageService: UserService,
    private modalService: ModalService,
    private productService: ProductsService,
    private cashSessionService: CashSessionService
  ) {}

  async ngOnInit(): Promise<void> {
    this.hasVisited = await this.storageService.hasVisited();

    if (!this.hasVisited) {
      this.abrirModalSetUp();
    }

    this.name = await this.storageService.getUserName();
    this.totalProducts = await this.totalProductsCount();
    this.hasProduct = this.totalProducts > 0;

    // Inicializar la gestión de sesiones de caja
    await this.initializeCashSession();

    // Cargar todas las sesiones para el calendario
    await this.loadAllSessions();

    // Generar el calendario
    this.generateCalendar();
  }

  async initializeCashSession(): Promise<void> {
    try {
      // Buscar si hay una sesión abierta
      const openSession = await this.cashSessionService.getOpen();

      if (openSession) {
        // Hay una sesión abierta
        const sessionDate = new Date(openSession.opened_at!);
        const today = new Date();

        // Verificar si la sesión es de hoy
        if (this.isSameDay(sessionDate, today)) {
          // Es del mismo día, usar la sesión actual
          this.currentSession = openSession;
          this.cashAmount = openSession.current_amount;
        } else {
          // Es de un día anterior, cerrar y crear nueva
          await this.cashSessionService.closeCashSession(
            openSession.id!,
            openSession.current_amount
          );

          // Crear nueva sesión con el monto actual de la anterior
          const newSession = await this.cashSessionService.openCashsession(
            openSession.current_amount
          );

          // Cargar la nueva sesión
          const session = await this.cashSessionService.getOpen();
          this.currentSession = session;
          this.cashAmount = session?.current_amount || 0;
        }
      } else {
        // No hay sesión abierta
        const allSessions = await this.cashSessionService.getAll();

        if (allSessions && allSessions.length > 0) {
          // Hay sesiones anteriores, usar el monto de la última
          const lastSession = allSessions[0]; // Ya está ordenado por fecha DESC
          await this.cashSessionService.openCashsession(lastSession.current_amount);
        } else {
          // No hay ninguna sesión, crear la primera con monto 0
          await this.cashSessionService.openCashsession(0);
        }

        // Cargar la sesión recién creada
        const session = await this.cashSessionService.getOpen();
        this.currentSession = session;
        this.cashAmount = session?.current_amount || 0;
      }
    } catch (error) {
      console.error('Error inicializando sesión de caja:', error);
      // En caso de error, intentar crear una sesión nueva con monto 0
      await this.cashSessionService.openCashsession(0);
      const session = await this.cashSessionService.getOpen();
      this.currentSession = session;
      this.cashAmount = session?.current_amount || 0;
    }
  }

  async loadAllSessions(): Promise<void> {
    try {
      this.allSessions = await this.cashSessionService.getAll();
    } catch (error) {
      console.error('Error cargando sesiones:', error);
      this.allSessions = [];
    }
  }

  generateCalendar(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    this.calendarDays = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);

      const session = this.allSessions.find(s =>
        this.isSameDay(new Date(s.opened_at!), date)
      );

      let status: 'empty' | 'closed' | 'open' = 'empty';

      if (session) {
        status = session.closed_at ? 'closed' : 'open';
      }

      this.calendarDays.push({
        date: date,
        status: status,
        session: session || null
      });
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  async totalProductsCount(): Promise<number> {
    return await this.productService.count();
  }

  loadCashAmount(): void {
    const savedAmount = localStorage.getItem('cashAmount');
    this.cashAmount = savedAmount ? parseFloat(savedAmount) : 0;
  }

  toggleCashVisibility(): void {
    this.isCashVisible = !this.isCashVisible;
  }

  handleIngreso(): void {
    console.log('Registrar ingreso');
  }

  handleEgreso(): void {
    console.log('Registrar egreso');
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

  formatDate(date: Date): string {
    return date.getDate().toString();
  }

  getDayName(date: Date): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  }

  formatSessionDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatSessionTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

interface CalendarDay {
  date: Date;
  status: 'empty' | 'closed' | 'open';
  session: CashSession | null;
}
