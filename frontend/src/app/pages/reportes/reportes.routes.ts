import { Routes } from "@angular/router";
import { ActivosComponent } from "./activos/activos.component";


export const REPORTES_ROUTES: Routes = [
  {
    path: 'reporte-de-activos',
    component: ActivosComponent,
    data: {
      title: 'Reportes de activos',
    },
  },
];
