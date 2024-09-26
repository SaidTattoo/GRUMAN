import { Routes } from "@angular/router";
import { VehiculosComponent } from "./vehiculos.component";

export const VEHICULOS_ROUTES: Routes = [
  {
    path: '',
    component: VehiculosComponent, data: {
      title: 'Vehiculos',
    },
  },
];
