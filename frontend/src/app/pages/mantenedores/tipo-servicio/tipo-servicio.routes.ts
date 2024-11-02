import { Routes } from "@angular/router";
import { TipoServicioComponent } from "./tipo-servicio.component";

export const TIPO_SERVICIO_ROUTES: Routes = [
    {
        path: '',
        component: TipoServicioComponent,
        data: { 
            title: 'Tipo Servicio'
        }
    }
]

