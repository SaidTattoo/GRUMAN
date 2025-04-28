import { Routes } from "@angular/router";
import { TipoSolicitudComponent } from "./tipo-solicitud.component";
import { CrearTipoSolicitudComponent } from "./crear-tipo-solicitud/crear-tipo-solicitud.component";
import { EditarTipoSolicitudComponent } from "./editar-tipo-solicitud/editar-tipo-solicitud.component";

export const TIPO_SOLICITUD_ROUTES: Routes = [
    {
        path: '',
        component: TipoSolicitudComponent,
        data: { 
            title: 'Tipo de solicitud'
        }
    },
    {
        path: 'crear',
        component: CrearTipoSolicitudComponent,
        data: { 
            title: 'Crear tipo de solicitud'
        }
    },
    {
        path: 'editar/:id',
        component: EditarTipoSolicitudComponent,
        data: { 
            title: 'Editar tipo de solicitud'
        }
    }
] 