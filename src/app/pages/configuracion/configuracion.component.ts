import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

interface ConfigForm {
  name: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  moneyGoal: number;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: [
    './configuracion.component.css',
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
export class ConfiguracionComponent implements OnInit {

  config: ConfigForm = {
    name: '',
    openHour: 9,
    openMinute: 0,
    closeHour: 18,
    closeMinute: 0,
    moneyGoal: 0
  };

  loading = true;
  saving = false;
  saveSuccess = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadConfig();
  }

  async loadConfig() {
    try {
      this.loading = true;

      const name = await this.userService.getUserName();
      const schedule = await this.userService.getSchedule();
      const moneyGoal = await this.userService.getMoneyGoal();

      if (name) {
        this.config.name = name;
      }

      if (schedule) {
        const [openH, openM] = schedule.open.split(':').map(Number);
        const [closeH, closeM] = schedule.close.split(':').map(Number);

        this.config.openHour = openH;
        this.config.openMinute = openM;
        this.config.closeHour = closeH;
        this.config.closeMinute = closeM;
      }
      if (moneyGoal) {
        this.config.moneyGoal = moneyGoal;
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.errorMessage = 'Error al cargar la configuración';
    } finally {
      this.loading = false;
    }
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Limitar a 13 caracteres
    if (value.length > 13) {
      value = value.substring(0, 13);
      input.value = value;
      this.config.name = value;
    }
  }

  onHourInput(event: Event, field: 'openHour' | 'closeHour') {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover caracteres no numéricos
    value = value.replace(/[^0-9]/g, '');

    // Limitar a 2 dígitos
    if (value.length > 2) {
      value = value.substring(0, 2);
    }

    // Convertir a número
    let numValue = value === '' ? 0 : parseInt(value, 10);

    // Validar rango 0-23
    if (numValue > 23) {
      numValue = 23;
      value = '23';
    }

    // Actualizar input y modelo
    input.value = value;
    this.config[field] = numValue;
  }

  onMinuteInput(event: Event, field: 'openMinute' | 'closeMinute') {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover caracteres no numéricos
    value = value.replace(/[^0-9]/g, '');

    // Limitar a 2 dígitos
    if (value.length > 2) {
      value = value.substring(0, 2);
    }

    // Convertir a número
    let numValue = value === '' ? 0 : parseInt(value, 10);

    // Validar rango 0-59
    if (numValue > 59) {
      numValue = 59;
      value = '59';
    }

    // Actualizar input y modelo
    input.value = value;
    this.config[field] = numValue;
  }

  onHourBlur(field: 'openHour' | 'closeHour') {
    // Si el valor es 0, establecer en 1 como mínimo
    if (this.config[field] === 0) {
      this.config[field] = 1;
    }
  }

  onMinuteBlur(field: 'openMinute' | 'closeMinute') {
    // Permitir 0 en minutos, solo validar que no sea negativo
    if (this.config[field] < 0) {
      this.config[field] = 0;
    }
  }

  async saveConfig() {
    if (!this.validateForm()) {
      return;
    }

    try {
      this.saving = true;
      this.errorMessage = '';
      this.saveSuccess = false;

      await this.userService.setUserName(this.config.name);

      await this.userService.setSchedule(
        this.config.openHour,
        this.config.openMinute,
        this.config.closeHour,
        this.config.closeMinute
      );

      await this.userService.updateMoneyGoal(this.config.moneyGoal);

      this.saveSuccess = true;
      setTimeout(() => {
        this.saveSuccess = false;
      }, 3000);
      // 🔄 Redirigir a load, que luego redirige a inicio
      this.router.navigate(['/load'], {
        queryParams: { target: '/inicio' }
      });

    } catch (error) {
      console.error('Error guardando configuración:', error);
      this.errorMessage = 'Error al guardar la configuración';
    } finally {
      this.saving = false;
    }
  }

  validateForm(): boolean {
    if (!this.config.name.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return false;
    }

    if (this.config.openHour < 1 || this.config.openHour > 23) {
      this.errorMessage = 'Hora de apertura inválida (1-23)';
      return false;
    }

    if (this.config.openMinute < 0 || this.config.openMinute > 59) {
      this.errorMessage = 'Minutos de apertura inválidos (0-59)';
      return false;
    }

    if (this.config.closeHour < 1 || this.config.closeHour > 23) {
      this.errorMessage = 'Hora de cierre inválida (1-23)';
      return false;
    }

    if (this.config.closeMinute < 0 || this.config.closeMinute > 59) {
      this.errorMessage = 'Minutos de cierre inválidos (0-59)';
      return false;
    }

    const openTime = this.config.openHour * 60 + this.config.openMinute;
    const closeTime = this.config.closeHour * 60 + this.config.closeMinute;

    if (openTime >= closeTime) {
      this.errorMessage = 'El horario de cierre debe ser posterior al de apertura';
      return false;
    }

    if (this.config.moneyGoal < 0) {
      this.errorMessage = 'La meta de dinero no puede ser negativa';
      return false;
    }

    return true;
  }

  resetFirstVisit() {
    if (confirm('¿Estás seguro de que deseas reiniciar la primera visita?')) {
      this.userService.clearVisited();
      alert('Primera visita reiniciada');
    }
  }

  formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
}
