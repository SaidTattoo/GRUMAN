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
    component: VerDetalleServicioComponent,
    data: {
      title: 'Detalle del Servicio'
    }
  }
];
