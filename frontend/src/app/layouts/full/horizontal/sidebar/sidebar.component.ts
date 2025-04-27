import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { navItems } from './sidebar-data';
import { Router, RouterModule } from '@angular/router';
import { NavService } from '../../../../services/nav.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { AppHorizontalNavItemComponent } from './nav-item/nav-item.component';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { StorageService } from 'src/app/services/storage.service';

interface User {
  selectedCompany?: {
    nombre: string;
  };
}

@Component({
  selector: 'app-horizontal-sidebar',
  standalone: true,
  imports: [AppHorizontalNavItemComponent, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class AppHorizontalSidebarComponent implements OnInit, OnDestroy {
  navItems = navItems;
  parentActive = '';
  hasPendingRequests = 0;
  private subscription: Subscription;
  private updateSubscription: Subscription;
  private storageSubscription: Subscription;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    public navService: NavService,
    public router: Router,
    media: MediaMatcher,
    changeDetectorRef: ChangeDetectorRef,
    private solicitarVisitaService: SolicitarVisitaService,
    private storage: StorageService
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 1100px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.router.events.subscribe(
      () => (this.parentActive = this.router.url.split('/')[1])
    );
  }

  ngOnInit(): void {
    this.storageSubscription = this.storage.user$.subscribe((user) => {
      if (user) {
        this.updateNavItems(user);
      }
    });
  }

  updateNavItems(user: User): void {
    const isGrumanCompany = (companyName: string | undefined): boolean => {
      if (!companyName) return false;
      return companyName.toLowerCase().trim() === 'gruman';
    };

    const showMantenedores = isGrumanCompany(user?.selectedCompany?.nombre);
    const showSolicitarVisita = !showMantenedores;

    // Agregar formato de fecha
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    this.navItems = [
      {
        navCap: 'Admin',
        children: [
          {
            displayName: 'Users',
            iconName: 'users',
            route: 'admin/users',
          },
        ],
      },
      {
        navCap: 'Home',
      },
      {
        displayName: 'Escritorio',
        iconName: 'home',
        route: 'dashboards',
        bgcolor: 'primary',
      },
      ...(showMantenedores
        ? [
          {
            displayName: 'Programación',
            iconName: 'calendar',
            children: [
              {
                displayName: 'Generar programación',
                iconName: 'plus',
                bgcolor: 'primary',
                route: 'generar-programacion',
              },
              {
                displayName: 'Listado de programación',
                iconName: 'list',
                bgcolor: 'primary',
                route: 'transacciones/listado-programacion',
              },

              {
                displayName: 'Solicitud de aprobación de correctiva',
                iconName: 'checkbox',
                bgcolor: 'primary',
                route: 'transacciones/solicitud-aprobacion-correctiva',
              },
              {
                displayName:
                  'Listado de solicitudes de aprobación de correctiva',
                iconName: 'list-check',
                bgcolor: 'primary',
                route:
                  'transacciones/listado-solicitud-aprobacion-correctiva',
              },
            ],
          },
        ]
        : []),
      ...(showSolicitarVisita
        ? [
          {
            displayName: 'Solicitar Visita',
            iconName: 'calendar-check',
            route: 'transacciones/solicitar-visita',
            bgcolor: 'primary',
          },
          {
            displayName: `Servicios del día ${formattedDate}`,
            iconName: 'calendar',
            bgcolor: 'primary',
            route: 'transacciones/solicitudes-del-dia-cliente',
          },
        ]
        : []),

      {
        displayName: 'Solicitudes',
        iconName: 'clipboard-list',
        children: [
          {
            displayName: 'Gestión de Solicitudes',
            iconName: 'home-shield',
            route: 'transacciones/solicitudes-de-visita/solicitudes',
          },
          {
            displayName: 'Solicitudes de Visita Pendiente',
            iconName: 'home-shield',
            route: 'transacciones/solicitudes-de-visita/pendientes',

          },
          {
            displayName: 'Visita aprobadas',
            iconName: 'checkbox',
            route: 'transacciones/solicitudes-de-visita/aprobadas',
          },
          {
            displayName: 'Visita rechazadas',
            iconName: 'ban',
            route: 'transacciones/solicitudes-de-visita/rechazadas',
          },
          {
            displayName: 'Visita finalizadas',
            iconName: 'flag-check',
            route: 'transacciones/solicitudes-de-visita/finalizadas',
          },
          {
            displayName: 'Visita validadas',
            iconName: 'user-check',
            route: 'transacciones/solicitudes-de-visita/validadas',
          },
          {
              displayName:'Visitas atendidas en proceso',
              iconName: 'user-check',
              route:'transacciones/solicitudes-de-visita/atendidas-en-proceso'
          }
        ],
      },
      {
        displayName: 'Reportes',
        iconName: 'file-search',
        children: [
          {
            displayName: 'Reporte de activos',
            iconName: 'file-delta',
            route: 'reportes/reporte-de-activos',
          },
         
        ],
      },
      /*  {
         displayName: 'Lista de Servicios Realizados',
         iconName: 'home-shield',
         bgcolor: 'primary',
         route: 'transacciones/lista-servicios-realizados',
       }, */
      ...(showMantenedores
        ? [

          {
            displayName: 'Servicios',
            iconName: 'server',
            route: 'mantenedores',
            children: [
              {
                displayName: 'Servicios realizados ',
                iconName: 'phone-check',
                route: 'transacciones/servicios-realizados',
              },
              {
                displayName: `Servicios del día | ${formattedDate}`,
                iconName: 'calendar',
                route: 'transacciones/solicitudes-del-dia',
              },
            ]
          },
          {
            displayName: 'Reportes',
            iconName: 'file-search',
            children: [
              {
                displayName: 'Reporte de activos',
                iconName: 'file-delta',
                route: 'reportes/reporte-de-activos',
              },
              {
                displayName: 'Reporte de repuestos por día',
                iconName: 'graph',
                route: 'reportes/repuestos-por-dia',
              },
              {
                displayName: 'Reporte de repuestos por mes',
                iconName: 'calendar',
                route: 'reportes/repuestos-por-mes',
              }, {
                displayName: 'Informe de consumo',
                iconName: 'graph',
                route: 'reportes/informe-de-consumo',
              },
            ],
          },
          {
            displayName: 'Mantenedores',
            iconName: 'user-cog',
            route: 'mantenedores',
            children: [
              {
                displayName: 'Carga masiva',
                iconName: 'upload',
                route: 'transacciones/solicitudes-de-visita/carga-masiva',
              },
              {
                displayName: 'Locales',
                iconName: 'building-store',
                route: 'mantenedores/locales',
              },
              {
                displayName: 'Móviles',
                iconName: 'car',
                route: 'mantenedores/vehiculos',
              },
              {
                displayName: 'Técnicos Gruman',
                iconName: 'users',
                route: 'mantenedores/tecnicos-gruman',
              },
              {
                displayName: 'Tipo activo',
                iconName: 'package',
                route: 'mantenedores/tipo-activo',
              },
              {
                displayName: 'Usuarios del sistema',
                iconName: 'users-group',
                route: 'mantenedores/usuarios',
              },
              {
                displayName: 'Técnicos móviles',
                iconName: 'user-bolt',
                route: 'mantenedores/tecnicos-moviles',
              },
              {
                displayName: 'Repuestos',
                iconName: 'tool',
                route: 'mantenedores/repuestos',
              },
              {
                displayName: 'Clientes',
                iconName: 'briefcase',
                route: 'mantenedores/clientes',
              },
              {
                displayName: 'Inspecciones',
                iconName: 'scan',
                route: 'mantenedores/lista-de-inspecciones',
              },

              {
                displayName: 'Listado de documentos',
                iconName: 'file-description',
                route: 'mantenedores/documentos',
              },
              {
                displayName: 'Tipo documento',
                iconName: 'files',
                route: 'mantenedores/documentos/tipo-documento',
              },
              {
                displayName: 'Tipo servicio',
                iconName: 'server-2',
                route: 'mantenedores/tipo-servicio',
              },
              {
                displayName: 'Sectores de trabajo',
                iconName: 'map-pin',
                route: 'mantenedores/sectores-trabajo',
              },
              {
                displayName: 'Causas raíz',
                iconName: 'file-search',
                route: 'mantenedores/causa-raiz',
              },

              {
                displayName: 'Activo fijo local',
                iconName: 'building-warehouse',
                route: 'mantenedores/activo-fijo-local',
              },
              {
                displayName: 'Especialidades',
                iconName: 'propeller',
                route: 'mantenedores/especialidades',
              },
              {
                displayName: 'Mes de facturación',
                iconName: 'receipt-2',
                route: 'mantenedores/mes-de-facturacion',
              },
            ],
          },
        ]
        : []),
    ];
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
