import { SolicitudesDeVisitaComponent } from "./solicitudes-de-visita.component";
import { Routes } from "@angular/router";
import { VerSolicitudComponent } from "./ver-solicitud/ver-solicitud.component";

export const SOLICITUDES_DE_VISITA_ROUTES: Routes = [
    { path: '', component: SolicitudesDeVisitaComponent ,
        data: {
            title: 'Solicitudes de Visita'
        }   
    },{
        path: ':id', component: VerSolicitudComponent,
        data: {
            title: 'Ver Solicitud'
        }
    }
];
