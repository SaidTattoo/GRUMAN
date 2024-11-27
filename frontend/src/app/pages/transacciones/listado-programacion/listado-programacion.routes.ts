import { EditarProgramacionComponent } from "./editar-programacion/editar-programacion.component";
import { ListadoProgramacionComponent } from "./listado-programacion.component";

export const LISTADO_PROGRAMACION_ROUTES = [
    {
        path: '',
        component: ListadoProgramacionComponent,
        data: {
            title: 'Listado de Programación'
        }
    },
    {
        path: 'editar-programacion/:id',
        component: EditarProgramacionComponent,
        data: {
            title: 'Editar Programación'
        }
    }
]