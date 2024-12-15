import { Routes } from "@angular/router";
import { ClientesComponent } from "./clientes.component";
import { CrearClienteComponent } from "./crear-cliente/crear-cliente.component";
import { EditarClientesComponent } from "./editar-clientes/editar-clientes.component";
import { ClienteListaDeInspeccionesComponent } from "./cliente-lista-de-inspecciones/cliente-lista-de-inspecciones.component";

export const CLIENTES_ROUTES: Routes = [
    {
        path: '',
        component: ClientesComponent,
        data: {
            title: 'Clientes',
        }
    },{
        path: 'crear',
        component: CrearClienteComponent,
        data: {
            title: 'Crear Cliente',
        }
    },
    {
        path: 'editar/:id',
        component: EditarClientesComponent,
        data: {
            title: 'Editar Cliente',
        }
    },
    {
        path: 'lista-de-inspecciones/:id',
        component: ClienteListaDeInspeccionesComponent,
        data: {
            title: 'Lista de Inspecciones',
        }
    }
]
