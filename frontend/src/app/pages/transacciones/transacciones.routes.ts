import { Routes } from '@angular/router';
import { SOLICITUDES_DEL_DIA_ROUTES } from './solicitudes-del-dia/solicitudes-del-dia.routes';

export const TRANSACCIONES_ROUTES: Routes = [
  {
    path: 'solicitudes-del-dia',
    children: SOLICITUDES_DEL_DIA_ROUTES
  }
]; 