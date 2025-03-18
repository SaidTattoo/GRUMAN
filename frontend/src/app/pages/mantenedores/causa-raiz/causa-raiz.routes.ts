import { Routes } from '@angular/router';
import { CausaRaizComponent } from './causa-raiz.component';
import { CrearCausaRaizComponent } from './crear-causa-raiz/crear-causa-raiz.component';
import { EditarCausaRaizComponent } from './editar-causa-raiz/editar-causa-raiz.component';


export const CAUSA_RAIZ_ROUTES: Routes = [
  {
    path: '',
   
    data: {
      roles: ['admin', 'gestor', 'secretaria', 'supervisor', 'tecnico'],
      title: 'Mantenedor de Causas Raíz'
    },
    children: [
      {
        path: '',
        component: CausaRaizComponent
      },
      {
        path: 'crear',
        component: CrearCausaRaizComponent,
       
        data: {
          roles: ['admin', 'gestor'],
          title: 'Crear Causa Raíz'
        }
      },
      {
        path: 'editar/:id',
        component: EditarCausaRaizComponent,
       
        data: {
          roles: ['admin', 'gestor'],
          title: 'Editar Causa Raíz'
        }
      }
    ]
  }
]; 