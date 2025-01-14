import { Routes } from "@angular/router";   
import { SectoresTrabajoComponent } from "./sectores-trabajo.component";
import { CrearSectorComponent } from "./crear-sector/crear-sector.component";
import { CrearSectorDefaultComponent } from "./crear-sector-default/crear-sector-default.component";
import { EditarSectorDefaultComponent } from './editar-sector-default/editar-sector-default.component';

export const SECTORES_TRABAJO_ROUTES: Routes = [
    {
        path: '',
        component: SectoresTrabajoComponent,
        data: {
            title: 'Sectores de Trabajo'
        }   
    },
    {
        path: 'crear-sector',
        component: CrearSectorComponent,
        data: {
            title: 'Crear Sector'
        }
    },
    {
        path: 'crear-sector-default',
        component: CrearSectorDefaultComponent,
        data: {
            title: 'Crear Sector por defecto'
        }
    },
    {
        path: 'editar-default/:id',
        component: EditarSectorDefaultComponent,
        data: {
            title: 'Editar Sector por defecto'
        }
    }
]

