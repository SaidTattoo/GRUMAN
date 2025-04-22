import { Routes } from '@angular/router';
import { SolicitudesDeVisitaComponent } from './solicitudes-de-visita.component';

import { SolicitudesFinalizadasRoutes } from './solicitudes-finalizadas/solicitudes-finalizadas.routes';
import { SolicitudesValidadasRoutes } from './solicitudes-validadas/solicitudes-validadas.routes';
import { SolicitudesRechazadasComponent } from './solicitudes-rechazadas/solicitudes-rechazadas.component';
import { SolicitudesAprobadasComponent } from './solicitudes-aprobadas/solicitudes-aprobadas.component';
import { SolicitudesFinalizadasComponent } from './solicitudes-finalizadas/solicitudes-finalizadas.component';
import { SolicitudesValidadasComponent } from './solicitudes-validadas/solicitudes-validadas.component';
import { ModificarSolicitudComponent } from './modificar-solicitud/modificar-solicitud.component';
import { VerSolicitudComponent } from './ver-solicitud/ver-solicitud.component';
import { CargaMasivaComponent } from './carga-masiva/carga-masiva.component';

export const SolicitudesDeVisitaRoutes: Routes = [
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
    path: 'finalizadas',
    component: SolicitudesFinalizadasComponent,
    data: {
      title: 'Solicitudes Finalizadas'
    }
  },
  {
    path: 'validadas',
    component: SolicitudesValidadasComponent,
    data: {
      title: 'Solicitudes Validadas'
    }
  },
  {
    path: 'modificar/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Modificar Solicitud'
    }
  },
  {
    path: 'ver-solicitud/pendiente/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver Solicitud'
    }
  },
  {
    path: 'ver-solicitud/aprobada/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver Solicitud'
    }
  },
  {
    path: 'ver-solicitud/rechazada/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver Solicitud'
    }
  },
  {
    path: 'ver-solicitud/validada/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver Solicitud'
    }
  },
  {
    path: 'carga-masiva',
    component: CargaMasivaComponent,
    data: {
      title: 'Carga Masiva'
  }}
];
