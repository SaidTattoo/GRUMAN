import { Routes } from "@angular/router";
import { RepuestosComponent } from "./repuestos.component";
import { CrearRepuestosComponent } from "./crear-repuestos/crear-repuestos.component";
import { EditarRepuestosComponent } from "./editar-repuestos/editar-repuestos.component";

export const REPUESTOS_ROUTES: Routes = [
    {
        path: '',
        component: RepuestosComponent,
        data: {
            title: 'Repuestos',
        },
    },{
                path: 'crear-repuesto',
                component: CrearRepuestosComponent,
                data: {
                    title: 'Crear Repuesto',
                },
            },
            {
                path: 'editar-repuesto/:id',
                component: EditarRepuestosComponent,
                data: {
                    title: 'Editar Repuesto',
                },
            }

];
