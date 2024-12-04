import { Routes } from '@angular/router';
import { AppBoxedLoginComponent } from './boxed-login/boxed-login.component';
import { AppBoxedRegisterComponent } from './boxed-register/boxed-register.component';
import { SelectClientComponent } from './select-client/select-client.component';


export const AuthenticationRoutes: Routes = [
  {
    path: 'login',
    component: AppBoxedLoginComponent,
  },
  {
    path: 'register',
    component: AppBoxedRegisterComponent,
  },{
    path: 'select-client',
    component: SelectClientComponent
  }
];
