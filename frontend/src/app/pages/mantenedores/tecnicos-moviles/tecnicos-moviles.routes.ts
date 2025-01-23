import { Routes } from '@angular/router';
import { TecnicosMovilesComponent } from "./tecnicos-moviles.component";
import { HistorialComponent } from './historial/historial.component';

export const TECHNICOS_MOVILES_ROUTES: Routes = [
    {
        path: '',
        component: TecnicosMovilesComponent,
        data: {
            title: 'Tecnicos Moviles',
            breadcrumb: 'Tecnicos Moviles'
        }
    },
    {
        path: 'historial',
        component: HistorialComponent,
        data: {
            title: 'Historial de Asignaciones',
            urls: [
                { title: 'Técnicos Móviles', url: '/mantenedores/tecnicos-moviles' },
                { title: 'Historial' }
            ]
        }
    }
];