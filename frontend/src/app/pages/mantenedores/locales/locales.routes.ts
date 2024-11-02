import { Routes } from "@angular/router";
import { CrearLocalComponent } from "./crear-local/crear-local.component";
import { LocalesComponent } from "./locales/locales.component";
import { EditarLocalComponent } from "./editar-local/editar-local.component";


export const LOCALES_ROUTES: Routes = [
    {
      path: '',
      component: LocalesComponent,
      data: {
        title: 'Locales',
      },
    },{
      path: 'crear',
      component: CrearLocalComponent,
      data: {
        title: 'Crear Local',
      },
    },{
      path: 'editar/:id',
      component: EditarLocalComponent,
      data: {
        title: 'Editar Local',
      },
    }
  ];
