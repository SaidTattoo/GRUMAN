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
  constructor() {}
  cards = [
    { title: '14 Reactivo Pendientes Autorización', content: '', icon: 'assignment_late' },
    { title: '133 Correctivo Pendientes Autorización', content: '', icon: 'build' },
    { title: '133 Servicios autorizados y pendientes de visita', content: '', icon: 'assignment_turned_in' },
    { title: '3 Próxima Visita Preventiva', content: '', icon: 'event' },
    { title: 'Servicios del día', content: '', icon: 'today' },
    { title: 'Análisis de Causa Raíz', content: '', icon: 'search' },
    { title: '101.28% Cumplimiento Preventivos', content: '', icon: 'check_circle' },
    { title: 'Gastos Repuestos', content: '', icon: 'attach_money' },
    { title: 'Performance Reactivos', content: '', icon: 'trending_up' },
    { title: 'Gasto total Acumulado', content: '', icon: 'account_balance_wallet' },
    { title: 'Servicios Reactivos', content: '', icon: 'build_circle' },
    { title: 'Servicios Correctivos', content: '', icon: 'build' },
    { title: 'Resumen Ejecutivo', content: '', icon: 'description' },
    { title: 'Solicitud Correctiva', content: '', icon: 'assignment' },
    { title: 'Solicitudes Realizadas', content: '', icon: 'done_all' },
    { title: 'Reportes Técnicos', content: '', icon: 'report' }
  ];
  onCardClick(card: any) {
    //console.log('Card clicked:', card);
  }
}
