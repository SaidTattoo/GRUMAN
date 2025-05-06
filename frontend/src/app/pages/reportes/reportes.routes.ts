import { Routes } from "@angular/router";
import { ActivosComponent } from "./activos/activos.component";
import { InformeConsumoComponent } from "./informe-consumo/informe-consumo.component";
import { InformeConsumoFacturacionComponent } from "./informe-consumo-facturacion/informe-consumo-facturacion.component";
import { InformeGastosAcumuladosComponent } from "./informe-gastos-acumulados/informe-gastos-acumulados.component";
export const REPORTES_ROUTES: Routes = [
  {
    path: 'reporte-de-activos',
    component: ActivosComponent,
    data: {
      title: 'Reportes de activos',
    },
  },
  {
    path: 'repuestos-por-dia',
    component: InformeConsumoComponent,
    data: {
      title: 'Reporte de repuestos por día',
    },
  },
  {
    path: 'repuestos-por-mes',
    component: InformeConsumoFacturacionComponent,
    data: {
      title: 'Reporte de repuestos por mes',
    },
  },
  {
    path: 'informe-de-consumo',
    component: InformeConsumoComponent,
    data: {
      title: 'Informe de consumo',
    },
  },
  {
    path: 'informe-gastos-acumulados',
    component: InformeGastosAcumuladosComponent,
    data: {
      title: 'Informe de gastos acumulados',
    },
  },
];
