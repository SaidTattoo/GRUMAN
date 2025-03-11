import { Routes } from '@angular/router';
import { SolicitudesValidadasComponent } from './solicitudes-validadas.component';
import { HistorialSolicitudComponent } from '../historial-solicitud/historial-solicitud.component';

export const SolicitudesValidadasRoutes: Routes = [
  {
    path: '',
    component: SolicitudesValidadasComponent
  },
  {
    path: 'historial/:id',
    component: HistorialSolicitudComponent
  }
]; 