import { Component, OnInit, OnDestroy } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// components
import { AppCongratulateCardComponent } from '../../../components/dashboard1/congratulate-card/congratulate-card.component';
import { AppPaymentsComponent } from '../../../components/dashboard1/payments/payments.component';
import { AppProductsComponent } from '../../../components/dashboard1/products/products.component';
import { AppLatestDealsComponent } from '../../../components/dashboard1/latest-deals/latest-deals.component';
import { AppCustomersComponent } from '../../../components/dashboard1/customers/customers.component';
import { AppTopProjectsComponent } from '../../../components/dashboard1/top-projects/top-projects.component';
import { AppVisitUsaComponent } from '../../../components/dashboard1/visit-usa/visit-usa.component';
import { AppLatestReviewsComponent } from '../../../components/dashboard1/latest-reviews/latest-reviews.component';
import { MaterialModule } from 'src/app/material.module';
import { DashboardService } from 'src/app/services/dashboard.service';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { FacturacionService } from 'src/app/services/facturacion.service';

export enum TipoOrden {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo',
  REACTIVO = 'reactivo'
}

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TablerIconsModule,
    AppCongratulateCardComponent,
    AppCustomersComponent,
    AppProductsComponent,
    AppTopProjectsComponent,
    AppPaymentsComponent,
    AppLatestDealsComponent,
    AppVisitUsaComponent,
    AppProductsComponent,
    AppLatestReviewsComponent,
  ],
  templateUrl: './dashboard1.component.html',
  styles: [
    `
      .card-container {
     flex: 1 1 calc(12.5% - 16px); /* 12.5% width for 8 cards per row, minus margin */
     margin: 8px;
     cursor: pointer;
   }

   .cardWithShadow {
     height: 100%;
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;
     text-align: center;
   }

   .mat-card-content {
     display: flex;
     flex-direction: column;
     align-items: center;
   }

   .mat-card-content mat-icon {
     font-size: 40px;
     margin-bottom: 8px;
   }

   .mat-card-content h3 {
     margin: 0;
     font-size: 1.2em;
   }

   .mat-card-content p {
     margin: 0;
     font-size: 0.9em;
   }
    `,
  ],
})
export class AppDashboard1Component implements OnInit, OnDestroy {
  constructor(
    private dashboardService: DashboardService, 
    private storageService: StorageService,
    private userService: UserService,
    private router: Router,
    private facturacionService: FacturacionService
  ) { }

  cards = [
    { title: '14 Reactivo Pendientes Autorización', content: '', image: 'assets/images/cancel.png', icon: 'assignment_late' },
    { title: '133 Correctivo Pendientes Autorización', content: '', image: 'assets/images/computer.png', icon: 'build' },
    { title: '133 Servicios autorizados y pendientes de visita', content: '', image: 'assets/images/computer.png', icon: 'assignment_turned_in' },
    { title: '3 Próxima Visita Preventiva', content: '', image: 'assets/images/location.png', icon: 'event' },
    { title: 'Servicios del día', content: '', image: 'assets/images/computer.png', icon: 'today' },
    { title: 'Análisis de Causa Raíz', content: '', image: 'assets/images/computer.png', icon: 'search' },
    { title: '101.28% Cumplimiento Preventivos', content: '', image: 'assets/images/computer.png', icon: 'check_circle' },
    { title: 'Gastos Repuestos', content: '', image: 'assets/images/settings.png', icon: 'attach_money' },
    { title: 'Performance Reactivos', content: '', image: 'assets/images/computer.png', icon: 'trending_up' },
    { title: 'Gasto total Acumulado', content: '', image: 'assets/images/computer.png', icon: 'account_balance_wallet' },
    { title: 'Servicios Reactivos', content: '', image: 'assets/images/computer.png', icon: 'build_circle' },
    { title: 'Servicios Correctivos', content: '', image: 'assets/images/computer.png', icon: 'build' },
    { title: 'Resumen Ejecutivo', content: '', image: 'assets/images/computer.png', icon: 'description' },
    { title: 'Solicitud Correctiva', content: '', image: 'assets/images/computer.png', icon: 'assignment' },
    { title: 'Solicitudes Realizadas', content: '', image: 'assets/images/computer.png', icon: 'done_all' },
    { title: 'Reportes Técnicos', content: '', image: 'assets/images/settings.png', icon: 'report' }
  ];
  onCardClick(card: any) {
    //console.log('Card clicked:', card);
  }

  aprobadas = 133;
  servicio = 131;
  count_proximas_visitas_preventivas = 3;
  count_servicios_del_dia = 10;
  count_analisis_causa_raiz = 10;
  count_cumplimiento_preventivos = 101.28;
  count_gastos_repostos = 10;
  count_performance_reactivos = 10;
  count_gasto_total_acumulado = 10;

  pendientes = 14;
  user: any;
  facturaciones: any[] = [];
  private companyChangeSubscription: Subscription;
  private userSubscription: Subscription;

  getReactivosPendientesAutorizacion() {
   
  }

  ngOnInit()  {
    // First get the most up-to-date user data from the UserService
    this.user = this.userService.getCurrentUser();
    
    // If no user or no selected company, redirect to select-client
    if (!this.user || !this.user.selectedCompany) {
      console.log('No user or selected company found, redirecting to select-client');
      this.router.navigate(['/authentication/select-client']);
      return;
    }

    this.obtenerFacturaciones();
    
    console.log('Dashboard initialized with company:', this.user.selectedCompany.nombre);
    
    // Load data with the current selected company
    this.loadDashboardData();
    
    // Subscribe to user changes
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        // Only reload if the user changes (not on initial subscription)
        if (this.user.selectedCompany) {
          console.log('User updated in dashboard');
          this.loadDashboardData();
        }
      }
    });
    
    // Subscribe to company change events
    this.companyChangeSubscription = this.storageService.companyChange$.subscribe(
      (company) => {
        if (company) {
          console.log('Company changed in dashboard:', company.nombre);
          this.user.selectedCompany = company;
          this.loadDashboardData();
        }
      }
    );
  }

  obtenerFacturaciones() {
    this.facturacionService.obtenerFacturaciones().subscribe((data: any) => {
      this.facturaciones = data;
      console.log('Facturaciones', this.facturaciones);
    });
  }

  ngOnDestroy() {
    if (this.companyChangeSubscription) {
      this.companyChangeSubscription.unsubscribe();
    }
    
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private loadDashboardData() {
    if (!this.user || !this.user.selectedCompany) {
      console.warn('Cannot load dashboard data: No user or selected company');
      return;
    }
    
    console.log('Loading dashboard data for company:', this.user.selectedCompany.nombre);
    
    if (this.user.selectedCompany.nombre === 'GRUMAN' || this.user.selectedCompany.nombre === 'Administrador') {
      this.dashboardService.getContadoresCantidad().subscribe((data: any) => {
        console.log('Contadores for GRUMAN/Admin:', data);
        this.updateDashboardCounters(data);
      });
    } else {
      this.dashboardService.getContadoresCantidad(this.user.selectedCompany.id).subscribe((data: any) => {
        console.log('Contadores for client:', this.user.selectedCompany.nombre, data);
        this.updateDashboardCounters(data);
      });
    }

    // Fetch client statistics
    this.dashboardService.getEstadisticasCantidadPorCliente().subscribe((data: any) => {
      console.log('Estadisticas por cliente', data);
    });

    // Fetch monthly statistics
    this.dashboardService.getEstadisticasMensualesCantidad(new Date().getFullYear(), 
      this.user.selectedCompany.nombre === 'GRUMAN' || this.user.selectedCompany.nombre === 'Administrador' 
        ? undefined 
        : this.user.selectedCompany.id
    ).subscribe((data: any) => {
      console.log('Estadisticas mensuales', data);
    });
  }

  private updateDashboardCounters(data: any) {
    this.pendientes = data.pendientes || 0;
    this.aprobadas = data.aprobadas || 0;
    this.servicio = data.enServicio || 0;
    this.count_proximas_visitas_preventivas = data.finalizadas || 0;
    this.count_servicios_del_dia = data.serviciosDelDia || 0;
    this.count_analisis_causa_raiz = data.analisisCausaRaiz || 0;
    this.count_cumplimiento_preventivos = data.cumplimientoPreventivos || 0;
  }
}


