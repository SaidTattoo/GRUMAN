import { Routes } from "@angular/router";
import { TipoServicioComponent } from "./tipo-servicio.component";
import { CrearTipoServicioComponent } from "./crear-tipo-servicio/crear-tipo-servicio.component";
import { EditarTipoServicioComponent } from "./editar-tipo-servicio/editar-tipo-servicio.component";

export const TIPO_SERVICIO_ROUTES: Routes = [
    {
        path: '',
        component: TipoServicioComponent,
        data: { 
            title: 'Tipo Servicio'
        }
    },
    {
        path: 'crear',
        component: CrearTipoServicioComponent,
        data: { 
            title: 'Crear Tipo de Servicio'
        }
    },{
        path: 'editar/:id',
        component: EditarTipoServicioComponent,
        data: { 
            title: 'Editar Tipo de Servicio'
        }
    }
]

