import { Routes } from "@angular/router";
import { CrearLocalComponent } from "./crear-local/crear-local.component";
import { LocalesComponent } from "./locales/locales.component";


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
    }
  ];
