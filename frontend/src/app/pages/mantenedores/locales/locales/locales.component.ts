import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { LocalesService } from 'src/app/services/locales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './locales.component.html',
  styleUrl: './locales.component.scss'
})
export class LocalesComponent implements OnInit, AfterViewInit {
  private map: any;
  displayedColumns: string[] = ['cliente','nombre_local', 'direccion', 'comuna', 'region', 'zona', 'grupo', 'referencia', 'telefono', 'email_local', 'email_encargado', 'nombre_encargado', 'latitud', 'longitud', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  constructor(private localesService: LocalesService, private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.loadLocales();
  }

  loadLocales() {
    this.localesService.getLocales().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.addMarkersToMap(data);
      },
      error: (error) => {
        console.error('Error al cargar locales:', error);
        Swal.fire('Error', 'No se pudieron cargar los locales', 'error');
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-33.4569, -70.6483],
      zoom: 12
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private addMarkersToMap(locales: any[]): void {
    const markers = L.featureGroup();
    locales.forEach(local => {
      if (local.latitud && local.longitud) {
        const marker = L.marker([local.latitud, local.longitud])
          .bindPopup(`
            <b>${local.direccion}</b><br>${local.comuna}<br>
            <img src="./assets/images/empresas/wazee.png" onclick="window.open('https://waze.com/ul?ll=${local.latitud},${local.longitud}&navigate=yes', '_blank')">
              Abrir en Waze
            </img>
          `);
        markers.addLayer(marker);
      }
    });
    markers.addTo(this.map);
    this.map.fitBounds(markers.getBounds());
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  modalEditarLocal(local: any) {
    this.router.navigate(['/mantenedores/locales/editar', local.id]);
  }

  modalNuevoLocal() {
    this.router.navigate(['/mantenedores/locales/crear']);
  }

  deleteLocal(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.localesService.deleteLocal(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(
              (local: any) => local.id !== id
            );
            this.addMarkersToMap(this.dataSource.data);
            Swal.fire(
              'Eliminado!',
              'El local ha sido eliminado.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            Swal.fire(
              'Error!',
              'No se pudo eliminar el local.',
              'error'
            );
          }
        });
      }
    });
  }
}
