import { ModificarSolicitudComponent } from "../solicitudes-de-visita/modificar-solicitud/modificar-solicitud.component";
import { ServiciosRealizadosComponent } from "./servicios-realizados.component";
import { VerDetalleServicioComponent } from "./ver-detalle-servicio/ver-detalle-servicio.component";

export const SERVICIOS_REALIZADOS_ROUTES = [
  {
    path: '',
    component: ServiciosRealizadosComponent,
    data: {
      title: 'Servicios Realizados'
    }
  },
  {
    path: ':id',
    component: ModificarSolicitudComponent,
    data: {
      title: 'Detalle del Servicio'
    }
  }
];
