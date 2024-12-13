import {  Routes } from "@angular/router";
import { TecnicosGrumanComponent } from "./tecnicos-gruman.component";
import { CrearTecnicoGrumanComponent } from "./crear-tecnico-gruman/crear-tecnico-gruman.component";
import { E } from "@angular/cdk/keycodes";
import { EditarTecnicoGrumanComponent } from "./editar-tecnico-gruman/editar-tecnico-gruman.component";

export const TECNICOS_GRUMAN_ROUTES: Routes = [
    {
      path: '',
      component: TecnicosGrumanComponent,
      data: {
        title: 'Tecnicos Gruman',
      },
    },
    {
      path: 'crear-tecnico-gruman',
      component: CrearTecnicoGrumanComponent,
      data: {
        title: 'Crear Tecnico Gruman',
      },
    },{
        path: 'editar-tecnico-gruman/:id',
        component: EditarTecnicoGrumanComponent,
        data: {
            title: 'Editar Tecnico Gruman',
        },
    }
  ];
  