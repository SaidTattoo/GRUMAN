import { Routes } from "@angular/router";
import { TipoServicioComponent } from "./tipo-servicio.component";
import { CrearTipoServicioComponent } from "./crear-tipo-servicio/crear-tipo-servicio.component";

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
    }
]

