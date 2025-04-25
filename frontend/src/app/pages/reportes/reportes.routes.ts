import { Routes } from "@angular/router";
import { ActivosComponent } from "./activos/activos.component";
import { InformeConsumoComponent } from "./informe-consumo/informe-consumo.component";

export const REPORTES_ROUTES: Routes = [
  {
    path: 'reporte-de-activos',
    component: ActivosComponent,
    data: {
      title: 'Reportes de activos',
    },
  },
  {
    path: 'informe-de-consumo',
    component: InformeConsumoComponent,
    data: {
      title: 'Informe de consumo',
    },
  },
];
