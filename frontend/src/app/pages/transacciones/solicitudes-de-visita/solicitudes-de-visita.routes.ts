import { Routes } from '@angular/router';
import { SolicitudesDeVisitaComponent } from './solicitudes-de-visita.component';
import { VerSolicitudComponent } from './ver-solicitud/ver-solicitud.component';
import { SolicitudesAprobadasComponent } from './solicitudes-aprobadas/solicitudes-aprobadas.component';
import { SolicitudesRechazadasComponent } from './solicitudes-rechazadas/solicitudes-rechazadas.component';

export const SOLICITUDES_DE_VISITA_ROUTES: Routes = [
  {
    path: '',
    component: SolicitudesDeVisitaComponent,
    data: {
      title: 'Solicitudes de Visita'
    }
  },
  {
    path: 'aprobadas',
    component: SolicitudesAprobadasComponent,
    data: {
      title: 'Solicitudes Aprobadas'
    }
  },
  {
    path: 'rechazadas',
    component: SolicitudesRechazadasComponent,
    data: {
      title: 'Solicitudes Rechazadas'
    }
  },
  {
    path: ':id',
    component: VerSolicitudComponent
  }
];
