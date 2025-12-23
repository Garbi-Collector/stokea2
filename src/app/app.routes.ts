import { Routes } from '@angular/router';

import { SidebarLayoutComponent } from './layout/sidebar-layout/sidebar-layout.component';

import { InicioComponent } from './pages/inicio/inicio.component';
import { VentaComponent } from './pages/venta/venta.component';
import { StockComponent } from './pages/stock/stock.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';

export const routes: Routes = [
  {
    path: '',
    component: SidebarLayoutComponent,
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'venta', component: VentaComponent },
      { path: 'stock', component: StockComponent },
      { path: 'historial', component: HistorialComponent },
      { path: 'configuracion', component: ConfiguracionComponent },

      // ruta por defecto
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  }
];
