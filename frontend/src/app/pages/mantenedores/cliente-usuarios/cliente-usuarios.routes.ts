import { Routes } from "@angular/router";   
import { ClienteUsuariosComponent } from "./cliente-usuarios.component";
import { EditarClienteUsuarioComponent } from "./editar-cliente-usuario/editar-cliente-usuario.component";

export const CLIENTE_USUARIOS_ROUTES: Routes = [
    {
        path: '',
        component: ClienteUsuariosComponent,
        data: { 
            title: 'Usuarios del sistema'
        }
    },
    {
        path: 'editar/:id',
        component: EditarClienteUsuarioComponent,
        data: {
            title: 'Editar Usuario del sistema'
        }
    }
];
