import { Routes } from "@angular/router";
import { GenerarProgramacionComponent } from "./generar-programacion.component";

export const GENERAR_PROGRAMACION_ROUTES: Routes = [
    {
        path: '',
        component: GenerarProgramacionComponent,
        data: {
            title: 'Generar programación'
        }
    }
]