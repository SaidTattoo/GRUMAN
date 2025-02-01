import { Routes } from '@angular/router';
import { SolicitudesDelDiaClienteComponent } from './solicitudes-del-dia-cliente.component';

const today = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export const SOLICITUDES_DEL_DIA_CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: SolicitudesDelDiaClienteComponent,
    data: {
      title: `Mis Servicios del día ${today}`
    }
  }
]; 