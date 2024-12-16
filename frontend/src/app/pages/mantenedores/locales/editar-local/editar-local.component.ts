import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { LocalesService } from 'src/app/services/locales.service';
import { RegionesComunasService } from 'src/app/services/regiones-comunas.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-editar-local',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './editar-local.component.html',
  styleUrls: ['./editar-local.component.scss']
})
export class EditarLocalComponent implements OnInit{
  localForm: FormGroup;
  clientes: any[] = [];
  regiones: any[] = [];
  provincias: any[] = [];
  comunas: any[] = [];
  localId: number;

  constructor(
    private fb: FormBuilder,
    private localesService: LocalesService,
    private router: Router,
    private route: ActivatedRoute,
    private clientesService: ClientesService,
    private regionesComunasService: RegionesComunasService,
    private cdr: ChangeDetectorRef
  ) {
    this.localForm = this.fb.group({
      nombre_local: ['', Validators.required],
      direccion: ['', Validators.required],
      region: ['', Validators.required],
      provincia: [{value: '', disabled: true}, Validators.required],
      comuna: [{value: '', disabled: true}, Validators.required],
      cliente: ['', Validators.required],
      zona: [''],
      grupo: ['', Validators.required],
      referencia: [''],
      telefono: ['', Validators.required],
      email_local: ['', [Validators.required, Validators.email]],
      email_encargado: ['', [Validators.required, Validators.email]],
      nombre_encargado: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      numeroLocal: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.localId = Number(this.route.snapshot.params['id']);

    forkJoin({
      local: this.localesService.getLocalById(this.localId),
      clientes: this.clientesService.getClientes(),
      regiones: this.regionesComunasService.getRegiones()
    }).subscribe({
      next: ({ local, clientes, regiones }) => {
        this.clientes = clientes;
        this.regiones = regiones.sort((a, b) => 
          a.region_nombre.localeCompare(b.region_nombre)
        );

        // Cargar provincias
        this.regionesComunasService.getProvinciasByRegion(local.region.region_id).subscribe(provincias => {
          this.provincias = provincias;
          this.localForm.get('provincia')?.enable();

          // Cargar comunas
          this.regionesComunasService.getComunasByProvincia(local.provincia.provincia_id).subscribe(comunas => {
            this.comunas = comunas;
            this.localForm.get('comuna')?.enable();

            // Establecer valores en el formulario
            this.localForm.patchValue({
              region: local.region.region_id,
              provincia: local.provincia.provincia_id,
              comuna: local.comuna.comuna_id,
              nombre_local: local.nombre_local,
              direccion: local.direccion,
              cliente: local.client.id,
              zona: local.zona,
              grupo: local.grupo,
              referencia: local.referencia,
              telefono: local.telefono,
              email_local: local.email_local,
              email_encargado: local.email_encargado,
              nombre_encargado: local.nombre_encargado,
              latitud: local.latitud,
              longitud: local.longitud,
              numeroLocal: local.numeroLocal
            });

            // Forzar la detección de cambios
            this.cdr.detectChanges();
          });
        });
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      }
    });
  }

  getClientes() {
    this.clientesService.getClientes().subscribe((data) => {
      console.log('****', data);
      this.clientes = data;
    });
  }

  cargarRegiones() {
    this.regionesComunasService.getRegiones().subscribe({
      next: (data) => {
        this.regiones = data.sort((a, b) => {
          if (a.region_nombre.includes('Metropolitana')) return -1;
          if (b.region_nombre.includes('Metropolitana')) return 1;
          return a.region_nombre.localeCompare(b.region_nombre);
        });

        if (this.regiones.length > 0) {
          const regionMetropolitana = this.regiones.find(r => 
            r.region_nombre.includes('Metropolitana')
          );
          
          if (regionMetropolitana) {
            this.localForm.patchValue({ region: regionMetropolitana.region_id });
            this.regionesComunasService.getProvinciasByRegion(regionMetropolitana.region_id).subscribe({
              next: (provincias) => {
                this.provincias = provincias;
              },
              error: (error) => {
                console.error('Error al cargar provincias:', error);
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar regiones:', error);
      }
    });
  }

  onRegionChange(event: MatSelectChange) {
    const regionId = event.value;
    this.localForm.patchValue({ provincia: '', comuna: '' });
    this.provincias = [];
    this.comunas = [];

    if (regionId) {
      this.localForm.get('provincia')?.enable();
      this.regionesComunasService.getProvinciasByRegion(regionId).subscribe({
        next: (data) => {
          this.provincias = data;
        },
        error: (error) => {
          console.error('Error al cargar provincias:', error);
        }
      });
    } else {
      this.localForm.get('provincia')?.disable();
      this.localForm.get('comuna')?.disable();
    }
  }

  onProvinciaChange(event: MatSelectChange) {
    const provinciaId = event.value;
    this.localForm.patchValue({ comuna: '' });
    this.comunas = [];

    if (provinciaId) {
      this.localForm.get('comuna')?.enable();
      this.regionesComunasService.getComunasByProvincia(provinciaId).subscribe({
        next: (data) => {
          this.comunas = data;
        },
        error: (error) => {
          console.error('Error al cargar comunas:', error);
        }
      });
    } else {
      this.localForm.get('comuna')?.disable();
    }
  }

  onSubmit() {
    this.localForm.get('provincia')?.enable();
    this.localForm.get('comuna')?.enable();

    if (this.localForm.valid) {
      Swal.fire({
        title: '¿Estás seguro que deseas actualizar este local?',
        text: 'Por favor, espere...',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.localesService.updateLocal(this.localId, this.localForm.value).subscribe({
            next: (data) => {
              Swal.fire('Éxito', 'Local actualizado correctamente', 'success');
              this.router.navigate(['/mantenedores/locales']);
            },
            error: (error) => {
              console.error('Error al actualizar:', error);
              Swal.fire('Error', 'No se pudo actualizar el local', 'error');
            }
          });
        } 
      });
    }
  }

  onClienteChange(event: any) {
    const clienteId = event.value;
    //console.log('Cliente seleccionado:', clienteId);
    let nombreCliente = this.clientes.find(cliente => cliente.id === this.localForm.get('cliente')?.value)?.nombre;
    const palabrasExcluidas = ['y', 'de', 'la', 'el', 'los', 'las', 'del', 'al', 'en', 'por', 'con', 'para'];
    if (nombreCliente) {
      const palabras = nombreCliente.split(' ').filter((palabra: string) => !palabrasExcluidas.includes(palabra.toLowerCase()));

      nombreCliente = palabras.map((palabra: string) => palabra.charAt(0).toUpperCase()).join('');
    }

    //console.log('****', nombreCliente );
  }

  onCancel() {
    this.router.navigate(['/mantenedores/locales']);
  }
}
