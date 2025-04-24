import { Routes } from "@angular/router";
import { ActivoFijoLocalComponent } from "./activo-fijo-local.component";
import { CrearActivoFijoLocalComponent } from "./crear-activo-fijo-local/crear-activo-fijo-local.component";
import { EditarActivoFijoLocalComponent } from "./editar-activo-fijo-local/editar-activo-fijo-local.component";

export const ACTIVO_FIJO_LOCAL_ROUTES: Routes = [
    {
        path: '',
        component: ActivoFijoLocalComponent,
        data: {
            title: 'Activo fijo local',
        }
    },
    {
        path: 'crear', component: CrearActivoFijoLocalComponent,
        data: {
            title: 'Crear activo fijo local',
        }
    },
    {
        path: 'editar/:id', component: EditarActivoFijoLocalComponent,
        data: {
            title: 'Editar activo fijo local',
        }
    }
];
