import { Routes } from '@angular/router';
import { SOLICITUDES_DEL_DIA_ROUTES } from './solicitudes-del-dia/solicitudes-del-dia.routes';
import { SOLICITUDES_DEL_DIA_CLIENTE_ROUTES } from './solicitudes-del-dia-cliente/solicitudes-del-dia-cliente.routes';

export const TRANSACCIONES_ROUTES: Routes = [
  {
    path: 'solicitudes-del-dia',
    children: SOLICITUDES_DEL_DIA_ROUTES
  },
  {
    path: 'solicitudes-del-dia-cliente',
    children: SOLICITUDES_DEL_DIA_CLIENTE_ROUTES
  }
]; 