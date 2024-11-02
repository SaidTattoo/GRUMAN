import { Routes } from "@angular/router";
import { DocumentosComponent } from "./documentos.component";
import { CrearTipoDocumentoComponent } from "./crear-tipo-documento/crear-tipo-documento.component";
import { TipoDocumentoComponent } from "./tipo-documento/tipo-documento.component";
import { SubirDocumentoComponent } from "./subir-documento/subir-documento.component";

export const DOCUMENTOS_ROUTES: Routes = [
    {
        path: '',
        component: DocumentosComponent,
        data: {
            title: 'Documentos',
        },
    },
    {
        path: 'tipo-documento',
        component: TipoDocumentoComponent,
        data: {
            title: 'Tipo Documento',
        },
    },
    {
        path: 'crear-tipo-documento',
        component: CrearTipoDocumentoComponent,
        data: {
            title: 'Crear Tipo Documento',
        },
    },
    {
        path: 'subir-documento',
        component: SubirDocumentoComponent,
        data: {
            title: 'Subir Documento',
        },
    },

];