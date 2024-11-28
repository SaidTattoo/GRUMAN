import { Routes } from "@angular/router";
import { ActivoFijoLocalComponent } from "./activo-fijo-local.component";
import { CrearActivoFijoLocalComponent } from "./crear-activo-fijo-local/crear-activo-fijo-local.component";
import { EditarActivoFijoLocalComponent } from "./editar-activo-fijo-local/editar-activo-fijo-local.component";

export const ACTIVO_FIJO_LOCAL_ROUTES: Routes = [
    { path: '', 
        component: ActivoFijoLocalComponent,
        data: {
            title: 'Activo Fijo Local', 
        }
    },
    { path: 'crear', component: CrearActivoFijoLocalComponent,
        data: {
            title: 'Crear Activo Fijo Local', 
        }
     },
     { path: 'editar/:id', component: EditarActivoFijoLocalComponent,
        data: {
            title: 'Editar Activo Fijo Local', 
        }
     } 
];
