import { Routes } from '@angular/router';
import { TecnicosComponent } from './tecnicos.component';
import { CambiarPasswordComponent } from './cambiar-password/cambiar-password.component';

export const TECNICOS_ROUTES: Routes = [
  {
    path: '',
    component: TecnicosComponent,
    data: {
      title: 'Trabajadores',
    },
  },
  {
    path: 'cambiar-password',
    component: CambiarPasswordComponent,
    data: {
      title: 'Cambiar Password',
    },
  },
];
