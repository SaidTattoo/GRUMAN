import { Routes } from '@angular/router';
import { TecnicosComponent } from './tecnicos.component';

export const TECNICOS_ROUTES: Routes = [
  {
    path: '',
    component: TecnicosComponent,
    data: {
      title: 'Tecnicos',
    },
  },
];
