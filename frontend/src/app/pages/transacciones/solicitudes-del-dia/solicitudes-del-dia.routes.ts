import { Routes } from '@angular/router';
import { SolicitudesDelDiaComponent } from './solicitudes-del-dia.component';

const today = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export const SOLICITUDES_DEL_DIA_ROUTES: Routes = [
  {
    path: '',
    component: SolicitudesDelDiaComponent,
    data: {
      title: `Solicitudes del día ${today}`
    }
  }
]; 