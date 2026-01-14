import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from "../../modalconfigs/core/modal.service";
import { CashMovementsService } from '../../services/cash-movements.service';
import { CashSessionService } from '../../services/cash-session.service';
import { CashMovement, CashMovementType } from '../../models/cash-movement';

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
    description: ''
  };

  showErrors: { [key: string]: boolean } = {
    amount: false
  };

  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private modalService: ModalService,
    private cashMovementsService: CashMovementsService,
    private cashSessionService: CashSessionService
  ) {}

  ngOnInit(): void {
    // Obtener datos del modal (tipo de transacción)
    const modalData = (this.modalService as any).modalSubject?.value?.data;
    if (modalData?.type) {
      this.transactionType = modalData.type;
    }
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
    }
  }

  isValidForm(): boolean {
    return !!(
      this.form.amount &&
      this.form.amount > 0
    );
  }

  async guardar(): Promise<void> {
    // Validar campos
    this.validateField('amount');

    if (!this.isValidForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      // 1. Obtener la sesión abierta
      const openSession = await this.cashSessionService.getOpen();

      if (!openSession || !openSession.id) {
        throw new Error('No hay una sesión de caja abierta. Por favor, abre una sesión primero.');
      }

      // 2. Determinar el tipo de movimiento
      const movementType: CashMovementType = this.transactionType === 'ingreso' ? 'IN' : 'OUT';

      // 3. Crear el movimiento
      const movement: CashMovement = {
        cash_session_id: openSession.id,
        type: movementType,
        amount: this.form.amount!,
        description: this.form.description || undefined
      };

      await this.cashMovementsService.create(movement);

      // 4. Actualizar el current_amount de la sesión
      const delta = movementType === 'IN' ? this.form.amount! : -this.form.amount!;
      await this.cashSessionService.updateCurrentAmount(openSession.id, delta);

      console.log('Movimiento registrado exitosamente:', movement);

      // Cerrar modal con éxito
      this.modalService.close(true);
    } catch (error: any) {
      console.error('Error al guardar movimiento:', error);
      this.errorMessage = error.message || 'Error al registrar el movimiento. Intenta nuevamente.';
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelar(): void {
    this.modalService.close(false);
  }
}
