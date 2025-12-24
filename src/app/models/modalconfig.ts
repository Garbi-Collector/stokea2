import { Type } from '@angular/core';

export interface ModalConfig {
  title: string;
  component?: Type<any>; // Componente dinámico a cargar
  content?: string; // Contenido alternativo si no hay componente
  closable?: boolean;
  data?: any; // Datos para pasar al componente
  width?: string; // Ancho del modal (ej: '600px', '80%')
  height?: string; // Alto del modal
}
