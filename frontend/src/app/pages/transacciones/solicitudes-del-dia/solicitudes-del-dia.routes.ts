import { Routes } from '@angular/router';
import { SolicitudesDelDiaComponent } from './solicitudes-del-dia.component';

export const SOLICITUDES_DEL_DIA_ROUTES: Routes = [
  {
    path: '',
    component: SolicitudesDelDiaComponent,
    data: {
      title: 'Solicitudes del Día'
    }
  }
]; 