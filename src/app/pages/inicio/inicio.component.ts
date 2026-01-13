import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ModalService } from "../../modalconfigs/core/modal.service";
import { ModalComponent } from "../../modalconfigs/shared/components/modal/modal.component";
import { SetupModalComponent } from "../../modals/setup-modal/setup-modal.component";
import { ProductsService } from "../../services/products.service";
import { CalendarService } from "../../services/calendar.service";
import { CalendarDay } from "../../models/CalendarDay";

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

  // Propiedades para el calendario
  calendarDays: CalendarDay[] = [];
  currentMonth: string = '';
  currentYear: number = 0;
  today: Date = new Date();
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(
    private storageService: UserService,
    private modalService: ModalService,
    private productService: ProductsService,
    private calendarService: CalendarService
  ) {}

  async ngOnInit(): Promise<void> {
    this.hasVisited = await this.storageService.hasVisited();
    if (!this.hasVisited) {
      this.abrirModalSetUp();
    }
    this.name = await this.storageService.getUserName();
    this.totalProducts = await this.totalProductsCount();
    this.hasProduct = this.totalProducts > 0;
    this.loadCashAmount();

    // Inicializar calendario
    this.initCalendar();
  }

  initCalendar(): void {
    this.today = this.calendarService.getToday();
    this.currentYear = this.today.getFullYear();
    const currentMonthIndex = this.today.getMonth();
    this.calendarDays = this.calendarService.getMonthDays(this.currentYear, currentMonthIndex);
    this.currentMonth = this.calendarDays[15]?.monthName || '';
  }

  isToday(day: CalendarDay): boolean {
    return day.date.toDateString() === this.today.toDateString();
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
}
