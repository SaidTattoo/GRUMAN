import { Component } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

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

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [
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
    MaterialModule,
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
export class AppDashboard1Component {
  constructor( private dashboardService: DashboardService ) { }
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


  count_reactivos_pendientes_autorizacion = 14;
  count_correctivos_pendientes_autorizacion = 133;
  count_servicios_autorizados_pendientes_visita = 131;
  count_proximas_visitas_preventivas = 3;
  count_servicios_del_dia = 10;
  count_analisis_causa_raiz = 10;
  count_cumplimiento_preventivos = 101.28;
  count_gastos_repostos = 10;
  count_performance_reactivos = 10;
  count_gasto_total_acumulado = 10;

  getReactivosPendientesAutorizacion() {
    this.dashboardService.getReactivosPendientesAutorizacion().subscribe((data: any) => {
      this.count_reactivos_pendientes_autorizacion = data.count;
    });
    return this.count_reactivos_pendientes_autorizacion;
  }
}


