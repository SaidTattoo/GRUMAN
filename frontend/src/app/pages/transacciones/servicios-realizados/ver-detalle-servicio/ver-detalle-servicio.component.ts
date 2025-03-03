import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/app/config';
@Component({
  selector: 'app-ver-detalle-servicio',
  standalone: true,
  imports: [
    MatCardModule   ,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './ver-detalle-servicio.component.html',
  styleUrls: ['./ver-detalle-servicio.component.scss']
})
export class VerDetalleServicioComponent implements OnInit {
  servicio: any;
  loading = true;
  fotoClienteUrl: string | null = null;
  private map: L.Map | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitarVisitaService: SolicitarVisitaService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('Inicializando componente...');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadServicio(id);
    }
  }

  loadServicio(id: string): void {
    console.log('Cargando servicio...');
    this.solicitarVisitaService.getSolicitudVisita(+id).subscribe({
      next: (data) => {
        console.log('Servicio cargado:', data);
        this.servicio = data;
        if (this.servicio.client?.foto) {
          this.fotoClienteUrl = `${environment.apiUrl}/uploads/clientes/${this.servicio.client.foto}`;
        }
        this.loading = false;

        // Esperar a que el DOM se actualice antes de inicializar el mapa
        setTimeout(() => {
          this.initMapWithMarker();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar el servicio:', error);
        this.snackBar.open('Error al cargar el servicio', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private initMapWithMarker(): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Contenedor del mapa no encontrado');
      return;
    }

    console.log('Inicializando mapa...');
    this.map = L.map('map', {
      center: [-33.4569, -70.6483],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // Agregar el marcador solo si el mapa se inicializó correctamente
    if (this.map && this.servicio?.local?.latitud && this.servicio?.local?.longitud) {
      const marker = L.marker([this.servicio.local.latitud, this.servicio.local.longitud])
        .bindPopup(`
          <b>${this.servicio.local.nombre_local}</b><br>
          ${this.servicio.local.direccion}<br>
          ${this.servicio.local.comuna}<br>
          <img src="./assets/images/empresas/wazee.png" 
               onclick="window.open('https://waze.com/ul?ll=${this.servicio.local.latitud},${this.servicio.local.longitud}&navigate=yes', '_blank')"
               style="cursor:pointer; width: 24px; height: 24px;">
          Abrir en Waze
        `);
      
      marker.addTo(this.map);
      this.map.setView([this.servicio.local.latitud, this.servicio.local.longitud], 15);
    }
  }

  getDuracionServicio(): string {
    if (!this.servicio?.fecha_hora_inicio_servicio || !this.servicio?.fecha_hora_fin_servicio) {
      return 'No disponible';
    }

    const inicio = new Date(this.servicio.fecha_hora_inicio_servicio);
    const fin = new Date(this.servicio.fecha_hora_fin_servicio);
    const diferencia = fin.getTime() - inicio.getTime();

    // Convertir a horas y minutos
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    if (horas === 0) {
      return `${minutos} minutos`;
    } else if (minutos === 0) {
      return `${horas} horas`;
    } else {
      return `${horas} horas ${minutos} minutos`;
    }
  }

  getRepuestosPorItem(itemId: number) {
    return this.servicio.itemRepuestos.filter(
      (repuesto: any) => repuesto.itemId === itemId
    );
  }

  getFotosPorItem(itemId: number) {
    return this.servicio.itemFotos.find(
      (foto: any) => foto.itemId === itemId
    );
  }

  openImage(imageUrl: string) {
    window.open(imageUrl, '_blank');
  }

  volver(): void {
    this.router.navigate(['/transacciones/servicios-realizados']);
  }

  validarSolicitud() {
    this.authService.currentUser.subscribe(currentUser => {
      if (!currentUser || !currentUser.id) {
        this.snackBar.open('Error: No se pudo obtener el usuario actual', 'Cerrar', {
          duration: 3000
        });
        return;
      }

      this.solicitarVisitaService.validarSolicitud(
        this.servicio.id,
        { validada_por_id: currentUser.id }
      ).subscribe({
        next: () => {
          this.snackBar.open('Solicitud validada correctamente', 'Cerrar', {
            duration: 3000
          });
          this.servicio.status = 'validada';
          this.loadServicio(this.servicio.id.toString());
        },
        error: (error) => {
          console.error('Error al validar la solicitud:', error);
          this.snackBar.open('Error al validar la solicitud', 'Cerrar', {
            duration: 3000
          });
        }
      });
    });
  }
} 