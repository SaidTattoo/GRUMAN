import { Routes } from "@angular/router";
import { ListaDeInspeccionesComponent } from "./lista-de-inspecciones.component";

export const LISTA_DE_INSPECCIONES_ROUTES: Routes = [
    {
        path: '',
        component: ListaDeInspeccionesComponent,
        data: {
            title: 'Listado de Inspecciones'
        }
    }
]