import { Routes } from '@angular/router';
import { UsersComponent } from './admin/users/users.component'; // Importa el nuevo componente
import { AuthGuard } from './guards/auth.guard';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login', // Redirige a la ruta de login
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'mantenedores/locales',
        loadChildren: () =>
          import('./pages/mantenedores/locales/locales.routes').then(
            (m) => m.LOCALES_ROUTES
          ),
      },
      {
        path: 'mantenedores/trabajadores',
        loadChildren: () =>
          import('./pages/mantenedores/trabajadores/trabajadores.routes').then(
            (m) => m.TRABAJADORES_ROUTES
          ),
      },
      {
        path: 'mantenedores/vehiculos',
        loadChildren: () =>
          import('./pages/mantenedores/vehiculos/vehiculos.routes').then(
            (m) => m.VEHICULOS_ROUTES
          ),
      },
      {
        path: 'mantenedores/tipo-activo',
        loadChildren: () =>
          import('./pages/mantenedores/tipo-activo/tipo-activo.routes').then(
            (m) => m.TIPO_ACTIVO_ROUTES
          ),
      },{
        path: 'mantenedores/tecnicos',
        loadChildren: () =>
          import('./pages/mantenedores/tecnicos/tecnicos.routes').then(
            (m) => m.TECNICOS_ROUTES
          ),
      },{
        path: 'mantenedores/repuestos',
        loadChildren: () =>
          import('./pages/mantenedores/repuestos/repuestos.routes').then(
            (m) => m.REPUESTOS_ROUTES
          ),
      },
      {
        path: 'mantenedores/clientes',
        loadChildren: () =>
          import('./pages/mantenedores/clientes/clientes.routes').then(
            (m) => m.CLIENTES_ROUTES
          ),
      },
      {
        path: 'mantenedores/documentos',
        loadChildren: () =>
          import('./pages/mantenedores/documentos/documentos.routes').then(
            (m) => m.DOCUMENTOS_ROUTES
          ),
      },{
        path: 'mantenedores/tipo-servicio',
        loadChildren: () =>
          import('./pages/mantenedores/tipo-servicio/tipo-servicio.routes').then(
            (m) => m.TIPO_SERVICIO_ROUTES
          ),
      },
      {
        path: 'reportes/generar-programacion',
        loadChildren: () =>
          import('./pages/transacciones/generar-programacion/generar-programacion.routes').then(
            (m) => m.GENERAR_PROGRAMACION_ROUTES
          ),
      },
      {
        path: 'starter',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'dashboards',
        loadChildren: () =>
          import('./pages/dashboards/dashboards.routes').then(
            (m) => m.DashboardsRoutes
          ),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./pages/forms/forms.routes').then((m) => m.FormsRoutes),
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./pages/charts/charts.routes').then((m) => m.ChartsRoutes),
      },
      {
        path: 'apps',
        loadChildren: () =>
          import('./pages/apps/apps.routes').then((m) => m.AppsRoutes),
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./pages/widgets/widgets.routes').then((m) => m.WidgetsRoutes),
      },
      {
        path: 'tables',
        loadChildren: () =>
          import('./pages/tables/tables.routes').then((m) => m.TablesRoutes),
      },
      {
        path: 'datatable',
        loadChildren: () =>
          import('./pages/datatable/datatable.routes').then(
            (m) => m.DatatablesRoutes
          ),
      },
      {
        path: 'theme-pages',
        loadChildren: () =>
          import('./pages/theme-pages/theme-pages.routes').then(
            (m) => m.ThemePagesRoutes
          ),
      },
      {
        path: 'admin/users',
        component: UsersComponent,
        canActivate: [AuthGuard], // Protege la ruta con el guardia de autenticación
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
      {
        path: 'landingpage',
        loadChildren: () =>
          import('./pages/theme-pages/landingpage/landingpage.routes').then(
            (m) => m.LandingPageRoutes
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'auth/login', // Redirige a la ruta de login para rutas no encontradas
  },
];
