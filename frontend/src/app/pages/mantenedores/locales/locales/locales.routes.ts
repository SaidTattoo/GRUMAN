import { Routes } from "@angular/router";
import { LocalesComponent } from "./locales.component";

export const LOCALES_ROUTES: Routes = [
    {
      path: '',
      component: LocalesComponent,
      data: {
        title: 'Locales',
      },
    },
  ];