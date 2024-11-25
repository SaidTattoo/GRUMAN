import { ListaServiciosRealizadosComponent } from "./lista-servicios-realizados.component";
import { Routes } from "@angular/router";

export const LISTA_SERVICIOS_REALIZADOS_ROUTES: Routes = [
    { path: '', component: ListaServiciosRealizadosComponent,
        data: {
            title: 'Lista de Servicios Realizados'
        }
    }
];
