import { Routes } from "@angular/router";
import { RepuestosComponent } from "./repuestos.component";

export const REPUESTOS_ROUTES: Routes = [
    {
        path: '',
        component: RepuestosComponent,
        data: {
            title: 'Repuestos',
        },
    },
];
