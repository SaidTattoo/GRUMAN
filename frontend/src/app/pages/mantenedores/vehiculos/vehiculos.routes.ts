import { Routes } from "@angular/router";
import { VehiculosComponent } from "./vehiculos.component";
import { DocumentacionComponent } from "./documentacion/documentacion.component";
import { CrearVehiculoComponent } from "./crear-vehiculo/crear-vehiculo.component";
import { AsignarTecnicoComponent } from "./asignar-tecnico/asignar-tecnico.component";
import { VerVehiculoComponent } from "./ver-vehiculo/ver-vehiculo.component";

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
  },{
    path: 'asignar-tecnico/:id',
    component: AsignarTecnicoComponent, data: {
      title: 'Asignar Tecnico',
    },
  },{
    path: 'ver-vehiculo/:id',
    component: VerVehiculoComponent, data: {
      title: 'Ver Vehiculo',
    },
  }
];

