import { EditarMesDeFacturacionComponent } from "./editar-mes-de-facturacion/editar-mes-de-facturacion.component";
import { MesDeFacturacionComponent } from "./mes-de-facturacion.component";

export const MES_DE_FACTURACION_ROUTES = [
  { path: '', component: MesDeFacturacionComponent,
    data: {
      title: 'Mes de Facturación',
      breadcrumb: 'Mes de Facturación',
    },
   },
   { path: 'update/:id', component: EditarMesDeFacturacionComponent,
    data: {
      title: 'Actualizar Mes de Facturación',
      breadcrumb: 'Actualizar Mes de Facturación',
    },
   },
];
