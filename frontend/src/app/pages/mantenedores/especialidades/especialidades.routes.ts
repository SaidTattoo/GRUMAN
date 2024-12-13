import { Routes } from "@angular/router";   
import { EspecialidadesComponent } from "./especialidades.component";
import { EditarEspecialidadComponent } from "./editar-especialidad/editar-especialidad.component";
import { CrearEspecialidadComponent } from "./crear-especialidad/crear-especialidad.component";

export const ESPECIALIDADES_ROUTES: Routes = [
    {
        path: '',
        component: EspecialidadesComponent,
        data: {
            title: 'Especialidades',
            breadcrumb: 'Especialidades'
        }
    },
    {
        path: 'crear',
        component: CrearEspecialidadComponent,
        data: {
            title: 'Crear Especialidad',
            breadcrumb: 'Crear Especialidad'
        }
    },
    {
        path: 'editar/:id',
        component:  EditarEspecialidadComponent,
        data: {
            title: 'Editar Especialidad',
            breadcrumb: 'Editar Especialidad'
        }
    }
]

