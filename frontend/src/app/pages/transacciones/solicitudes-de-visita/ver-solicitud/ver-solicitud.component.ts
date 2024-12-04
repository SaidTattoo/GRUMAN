import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import Swal from 'sweetalert2';
import { VerImagenesComponent } from '../ver-imagenes/ver-imagenes.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-ver-solicitud',
  standalone: true,
  imports: [ 
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
  /*   ActivityImagesComponent,
    ActivityLocationComponent,
    ActivityDetailsComponent */
  ],
  templateUrl: './ver-solicitud.component.html',
  styleUrl: './ver-solicitud.component.scss'
})
export class VerSolicitudComponent implements OnInit {
  @Input() activity!: any;
  
  constructor(private route: ActivatedRoute, private solicitarVisitaService: SolicitarVisitaService, private router: Router, private dialog: MatDialog) {}

  getStatusClass(): string {
    return `status-${this.activity.status.toLowerCase()}`;
  }
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.solicitarVisitaService.getSolicitudVisita(id).subscribe((data: any) => {
      this.activity = data;
    });
    console.log(this.activity);
  }
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
    openImageDialog(imageUrl: string): void {
      this.dialog.open(VerImagenesComponent, {
        data: { imageUrl },
        maxWidth: '95vw',
        maxHeight: '95vh',
        panelClass: 'image-dialog',
        autoFocus: false
      });
  
  }
  approveActivity(): void {
    Swal.fire({
      title: '¿Estás seguro de aprobar esta solicitud?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitarVisitaService.aprobarSolicitudVisita(this.activity.id).subscribe((data: any) => {
          console.log(data);
          this.router.navigate(['/transacciones/solicitudes-de-visita']);
        });
      }
    });
  }
  rejectActivity(): void {
    Swal.fire({
      title: '¿Estás seguro de rechazar esta solicitud?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitarVisitaService.rechazarSolicitudVisita(this.activity.id).subscribe((data: any) => {
          console.log(data);
          this.router.navigate(['/transacciones/solicitudes-de-visita']);
        });
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/transacciones/solicitudes-de-visita']);
  }
}
