import { Type } from '@angular/core';

export interface ModalConfig {
  title: string;
  component?: Type<any>;
  content?: string;
  closable?: boolean; // Controla si se puede cerrar con el botón X
  closeOnBackdrop?: boolean; // NUEVO: Controla si se puede cerrar tocando el fondo
  data?: any;
  width?: string;
  height?: string;
}
