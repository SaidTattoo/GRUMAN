import { Routes } from "@angular/router";
import { RepuestosComponent } from "./repuestos.component";
import { CrearRepuestosComponent } from "./crear-repuestos/crear-repuestos.component";

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
            }

];
