import { Routes } from "@angular/router";
import { TipoActivoComponent } from "./tipo-activo.component";

export const TIPO_ACTIVO_ROUTES: Routes = [
  {
    path: '',
    component: TipoActivoComponent,
    data: {
      title: 'Tipo Activo',
    },
  },
];
