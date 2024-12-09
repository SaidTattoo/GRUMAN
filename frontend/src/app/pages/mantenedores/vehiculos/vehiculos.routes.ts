import { Routes } from "@angular/router";
import { VehiculosComponent } from "./vehiculos.component";
import { DocumentacionComponent } from "./documentacion/documentacion.component";
import { CrearVehiculoComponent } from "./crear-vehiculo/crear-vehiculo.component";

export const VEHICULOS_ROUTES: Routes = [
  {
    path: '',
    component: VehiculosComponent, data: {
      title: 'Vehiculos',
    },
  },
  {
    path: 'documentacion/:id',
    component: DocumentacionComponent, data: {
      title: 'Documentación',
    },
  },{
    path: 'crear-vehiculo',
    component: CrearVehiculoComponent, data: {
      title: 'Crear Vehiculo',
    },
  }
];
