import { EditarSolicitudCorrectivaComponent } from "../editar-solicitud-correctiva/editar-solicitud-correctiva.component";
import { ListadoSolicitudAprobacionCorrectivaComponent } from "./listado-solicitud-aprobacion-correctiva.component";

export const LISTADO_SOLICITUD_APROBACION_CORRECTIVA_ROUTES = [
  {
    path: '',
    component: ListadoSolicitudAprobacionCorrectivaComponent,
    data: {
      title: 'Listado de solicitudes de aprobación de actividad correctiva',
    },
  },
  {
    path: 'editar-solicitud-aprobacion-correctiva/:id',
    component: EditarSolicitudCorrectivaComponent,
    data: {
      title: 'Editar solicitud de aprobación de actividad correctiva',
    },
  },
];
