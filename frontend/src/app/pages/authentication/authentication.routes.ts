import { Routes } from '@angular/router';
import { AppBoxedLoginComponent } from './boxed-login/boxed-login.component';
import { AppBoxedRegisterComponent } from './boxed-register/boxed-register.component';


export const AuthenticationRoutes: Routes = [
  {
    path: 'login',
    component: AppBoxedLoginComponent,
  },
  {
    path: 'register',
    component: AppBoxedRegisterComponent,
  },
];
