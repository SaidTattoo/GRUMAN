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
    this.storageSubscription = this.storage.user$.subscribe(user => {
      if (user) {
        this.updateNavItems(user);
      }
    });
  }

  updateNavItems(user: any): void {
    const hasGrumanCompany = (user: any): boolean => {
      if (!user?.selectedCompany) {
        return false;
      }
      return user.selectedCompany.nombre.toLowerCase() === 'gruman'.toLowerCase();
    };
  
    const showMantenedores = hasGrumanCompany(user);
    const showSolicitarVisita = !hasGrumanCompany(user);
  
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
        route: 'dashboards/dashboard1',
        bgcolor: 'primary',
      },
      ...(showMantenedores
        ? [
          {
            displayName: 'Programación',
            iconName: 'calendar',
            children: [
              {
                displayName: 'Generar Programación',
                iconName: 'home-shield',
                bgcolor: 'primary',
                route: 'generar-programacion',
              },
              {
                displayName: 'Listado de Programación',
                iconName: 'home-shield',
                bgcolor: 'primary',
                route: 'transacciones/listado-programacion',
              },
              {
                displayName: 'Solicitud de aprobación de correctiva',
                iconName: 'home-shield',
                bgcolor: 'primary',
                route: 'transacciones/solicitud-aprobacion-correctiva',
              },
              {
                displayName: 'Listado de solicitudes de aprobación de correctiva',
                iconName: 'home-shield',
                bgcolor: 'primary',
                route: 'transacciones/listado-solicitud-aprobacion-correctiva',
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
          ]
        : []),
        
     
      {
        displayName: 'Servicios realizados',
        iconName: 'home-shield',
        bgcolor: 'primary',
        route: 'transacciones/servicios-realizados',
      },
      {
        displayName: 'Lista de Servicios Realizados',
        iconName: 'home-shield',
        bgcolor: 'primary',
        route: 'transacciones/lista-servicios-realizados',
      },
      ...(showMantenedores
        ? [{
            displayName: 'Solicitudes de Visita',
            iconName: 'home-shield',
            route: 'transacciones/solicitudes-de-visita',
          },
            {
              displayName: 'Mantenedores',
              iconName: 'home-shield',
              route: 'mantenedores',
              children: [
                {
                  displayName: 'Locales',
                  iconName: 'home-shield',
                  route: 'mantenedores/locales',
                },
                {
                  displayName: 'Moviles',
                  iconName: 'car',
                  route: 'mantenedores/vehiculos',
                },{
                  displayName: 'Tecnicos Gruman',
                  iconName: 'home-shield',
                  route: 'mantenedores/tecnicos-gruman',
                },
                {
                  displayName: 'Tipo Activo',
                  iconName: 'home-shield',
                  route: 'mantenedores/tipo-activo',
                },
                {
                  displayName: 'Tecnicos',
                  iconName: 'user',
                  route: 'mantenedores/tecnicos',
                },
                {
                  displayName: 'Repuestos',
                  iconName: 'home-shield',
                  route: 'mantenedores/repuestos',
                },
                {
                  displayName: 'Clientes',
                  iconName: 'home-shield',
                  route: 'mantenedores/clientes',
                },  
                {
                  displayName: 'Inspecciones',
                  iconName: 'file-description',
                  route: 'mantenedores/lista-de-inspecciones',
                },
                {
                  displayName: 'Cliente Usuarios',
                  iconName: 'home-shield',
                  route: 'mantenedores/cliente-usuarios',
                },
                {
                  displayName: 'Listado de Documentos',
                  iconName: 'file-description',
                  route: 'mantenedores/documentos',
                },
                {
                  displayName: 'Tipo Documento',
                  iconName: 'home-shield',
                  route: 'mantenedores/documentos/tipo-documento',
                },
                {
                  displayName: 'Tipo Servicio',
                  iconName: 'home-shield',
                  route: 'mantenedores/tipo-servicio',
                },
                {
                  displayName: 'Sectores de Trabajo',
                  iconName: 'home-shield',
                  route: 'mantenedores/sectores-trabajo',
                },
                {
                  displayName: 'Servicios',
                  iconName: 'home-shield',
                  route: 'mantenedores/servicios',
                },
                {
                  displayName: 'Activo Fijo Local',
                  iconName: 'home-shield',
                  route: 'mantenedores/activo-fijo-local',
                },{
                  displayName: 'Especialidades',
                  iconName: 'home-shield',
                  route: 'mantenedores/especialidades',
                } ,
                {
                  displayName: 'Mes de Facturación',
                  iconName: 'home-shield',
                  route: 'mantenedores/mes-de-facturacion',
                }
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