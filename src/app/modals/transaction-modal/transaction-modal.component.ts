import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from "../../modalconfigs/core/modal.service";

export type TransactionType = 'ingreso' | 'egreso';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.css'
})
export class TransactionModalComponent implements OnInit {

  transactionType: TransactionType = 'ingreso';

  form = {
    amount: null as number | null,
    category: '',
    description: '',
    date: ''
  };

  showErrors: { [key: string]: boolean } = {
    amount: false,
    category: false,
    date: false
  };

  isSubmitting: boolean = false;

  // Categorías predefinidas
  ingresoCategories = [
    'Ventas',
    'Inversión',
    'Préstamo recibido',
    'Devolución',
    'Otro'
  ];

  egresoCategories = [
    'Compra de mercancía',
    'Alquiler',
    'Servicios',
    'Salarios',
    'Préstamo pagado',
    'Mantenimiento',
    'Transporte',
    'Otro'
  ];

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    // Obtener datos del modal (tipo de transacción)
    const modalData = (this.modalService as any).modalSubject?.value?.data;
    if (modalData?.type) {
      this.transactionType = modalData.type;
    }

    // Establecer fecha actual por defecto
    const today = new Date();
    this.form.date = today.toISOString().split('T')[0];
  }

  get categories(): string[] {
    return this.transactionType === 'ingreso'
      ? this.ingresoCategories
      : this.egresoCategories;
  }

  get title(): string {
    return this.transactionType === 'ingreso'
      ? 'Registrar Ingreso'
      : 'Registrar Egreso';
  }

  get subtitle(): string {
    return this.transactionType === 'ingreso'
      ? 'Registra el dinero que ingresa a tu caja'
      : 'Registra el dinero que sale de tu caja';
  }

  validateField(field: string): void {
    switch (field) {
      case 'amount':
        this.showErrors['amount'] = !this.form.amount || this.form.amount <= 0;
        break;
      case 'category':
        this.showErrors['category'] = !this.form.category || this.form.category.trim() === '';
        break;
      case 'date':
        this.showErrors['date'] = !this.form.date;
        break;
    }
  }

  isValidForm(): boolean {
    return !!(
      this.form.amount &&
      this.form.amount > 0 &&
      this.form.category &&
      this.form.category.trim() !== '' &&
      this.form.date
    );
  }

  async guardar(): Promise<void> {
    // Validar todos los campos
    this.validateField('amount');
    this.validateField('category');
    this.validateField('date');

    if (!this.isValidForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      // TODO: Aquí irá la lógica para guardar la transacción
      // await this.transactionService.create({
      //   ...this.form,
      //   type: this.transactionType
      // });

      console.log('Transacción registrada:', {
        type: this.transactionType,
        ...this.form
      });

      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 500));

      this.modalService.close(true);
    } catch (error) {
      console.error('Error al guardar transacción:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelar(): void {
    this.modalService.close(false);
  }
}
