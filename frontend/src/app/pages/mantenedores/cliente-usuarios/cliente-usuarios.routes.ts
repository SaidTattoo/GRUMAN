import { Routes } from "@angular/router";   
import { ClienteUsuariosComponent } from "./cliente-usuarios.component";

export const CLIENTE_USUARIOS_ROUTES: Routes = [
    {
        path: '',
        component: ClienteUsuariosComponent,
        data: { 
            title: 'Usuarios de Cliente'
        }
    }
];
