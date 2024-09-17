import { Routes } from "@angular/router";
import { TrabajadoresComponent } from "./trabajadores/trabajadores.component";

export const TRABAJADORES_ROUTES: Routes = [
    {
      path: '',
      component: TrabajadoresComponent,
      data: {
        title: 'Trabajadores',
      },
    },
  ];