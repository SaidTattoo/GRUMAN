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
import { SolicitudesComponent } from './solicitudes/solicitudes.component';
import { SolicitudesAtendidasEnProcesoComponent } from './solicitudes-atendidas-en-proceso/solicitudes-atendidas-en-proceso.component';

export const SolicitudesDeVisitaRoutes: Routes = [
  {
    path: 'pendientes',
    component: SolicitudesDeVisitaComponent,
    data: {
      title: 'Solicitudes de visita pendientes'
    }
  }, 
  {
    path: 'solicitudes',
    component: SolicitudesComponent,
    data: {
      title: 'Gestión de solicitudes'
    }
  },
  {
    path: 'aprobadas',
    component: SolicitudesAprobadasComponent,
    data: {
      title: 'Solicitudes aprobadas'
    }
  },
  {
    path: 'rechazadas',
    component: SolicitudesRechazadasComponent,
    data: {
      title: 'Solicitudes rechazadas'
    }
  },
  {
    path: 'finalizadas',
    component: SolicitudesFinalizadasComponent,
    data: {
      title: 'Solicitudes finalizadas'
    }
  },
  {
    path: 'validadas',
    component: SolicitudesValidadasComponent,
    data: {
      title: 'Solicitudes validadas'
    }
  },
  {
    path: 'atendidas-en-proceso',
    component: SolicitudesAtendidasEnProcesoComponent,
    data: {
      title: 'Solicitudes atendidas en proceso'
    }
  },
  {
    path: 'modificar/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Modificar solicitud'
    }
  },
  {
    path: 'ver-solicitud/pendiente/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver solicitud'
    }
  },
  {
    path: 'ver-solicitud/aprobada/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver solicitud'
    }
  },
  {
    path: 'ver-solicitud/rechazada/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver solicitud'
    }
  },
  {
    path: 'ver-solicitud/validada/:id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Ver solicitud'
    }
  },
  {
    path: 'carga-masiva',
    component: CargaMasivaComponent,
    data: {
      title: 'Carga masiva'
    }
  }
];
