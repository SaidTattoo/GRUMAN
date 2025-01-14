import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { LocalesService } from 'src/app/services/locales.service';
import { RegionesComunasService } from 'src/app/services/regiones-comunas.service';
import Swal from 'sweetalert2';
import { MatSelectChange } from '@angular/material/select';
import { MatSelect } from '@angular/material/select';
import { GeocodingService } from 'src/app/services/geocoding.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-crear-local',
  templateUrl: './crear-local.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatSelectModule, CommonModule],
  styleUrls: ['./crear-local.component.scss']
})
export class CrearLocalComponent implements OnInit {
  localForm: FormGroup;
  clientes: any[] = [];
  regiones: any[] = [];
  provincias: any[] = [];
  comunas: any[] = [];
  readonly REGION_METROPOLITANA_ID = 13; // ID de la RM
  suggestions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private localesService: LocalesService,
    private router: Router,
    private clientesService: ClientesService,
    private regionesComunasService: RegionesComunasService,
    private geocodingService: GeocodingService

  ) {
    this.localForm = this.fb.group({
      direccion: ['', Validators.required],
      region: ['', Validators.required],
      nombre_local: ['', Validators.required],
      provincia: [{value: '', disabled: true}, Validators.required],
      comuna: [{value: '', disabled: true}, Validators.required],
      clientId: ['', Validators.required],
      zona: [''],
      grupo: ['', Validators.required],     
      referencia: [''],
      telefono: ['', Validators.required],
      email_local: ['', [Validators.required, Validators.email]],
      email_encargado: ['', [Validators.required, Validators.email]],
      nombre_encargado: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      numeroLocal: ['', Validators.required],
      sobreprecio: [0, [Validators.required, Validators.min(0)]],
      valorPorLocal: [0, [Validators.required, Validators.min(0)]]
    });
    this.getClientes();
    this.cargarRegiones();
  }

  ngOnInit(): void {
    this.getClientes();
    this.cargarRegiones();
  }

  getClientes() {
    this.clientesService.getClientes().subscribe((data) => {
      //console.log('****', data);
      //omitir el ciente llamado GRUMAN 
      this.clientes = data.filter(cliente => cliente.nombre !== 'GRUMAN');
    });
  }
  calculateCoordinates() {
    const direccion = this.localForm.get('direccion')?.value;
    const comuna = this.comunas.find(
      (c) => c.comuna_id === this.localForm.get('comuna')?.value
    )?.comuna_nombre;
    const region = this.regiones.find(
      (r) => r.region_id === this.localForm.get('region')?.value
    )?.region_nombre;
  
    if (direccion && comuna && region) {
      const fullAddress = `${direccion}, ${comuna}, ${region}`;
      this.geocodingService.geocodeAddress(fullAddress).subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            const location = response[0];
            this.localForm.patchValue({
              latitud: location.lat,
              longitud: location.lon,
            });
            console.log('****', location);
          } else {
            console.error('No se encontraron coordenadas para esta dirección.');
            //mostrar que revise si esta bien escrita  la direccion y la numeracion y/o  comuna o region o provincia ya 
            Swal.fire({
              title: 'Error',
              text: 'No se encontraron coordenadas para esta dirección. Por favor, revise si la dirección está bien escrita y la numeración o la comuna, región o provincia.',
              icon: 'error'
            });
          }
        },
        error: (error) => {
          console.error('Error en la geocodificación:', error);
        },
      });
    }
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
    this.calculateCoordinates();
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
    this.calculateCoordinates();
  }

  onSubmit() {
    this.calculateCoordinates();
    // Habilitar los controles antes de enviar
    this.localForm.get('provincia')?.enable();
    this.localForm.get('comuna')?.enable();

    //console.log('****', this.localForm.value);
    const clienteId = this.localForm.get('clientId')?.value;
    let nombreCliente = this.clientes.find(cliente => cliente.id === clienteId)?.nombre;
    const palabrasExcluidas = ['y', 'de', 'la', 'el', 'los', 'las', 'del', 'al', 'en', 'por', 'con', 'para'];

    if (nombreCliente) {
      const palabras = nombreCliente.split(' ').filter((palabra: string) => !palabrasExcluidas.includes(palabra.toLowerCase()));
      nombreCliente = palabras.map((palabra: string) => palabra.charAt(0).toUpperCase()).join('');
    } else {
      console.error('Nombre del cliente no encontrado');
      return;
    }

    const timestamp = Date.now().toString();
    const numeroLocal = `${nombreCliente}-${timestamp}`;
    this.localForm.get('numeroLocal')?.setValue(numeroLocal);

    if (this.localForm.valid) {
      Swal.fire({
        title: '¿Estás seguro que deseas crear este local?',
        text: 'Por favor, espere...',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.localesService.crearLocal(this.localForm.value).subscribe((data) => {
            //console.log('****', data);
            this.router.navigate(['/mantenedores/locales']);
          });
        }
      });
    }
  }
  onDireccionChange() {
    this.calculateCoordinates();
  }
  onClienteChange(event: any) {
    const clienteId = event.value;
    //console.log('Cliente seleccionado:', this.clientes);
    let nombreCliente = this.clientes.find(cliente => cliente.id === clienteId)?.nombre;
    const palabrasExcluidas = ['y', 'de', 'la', 'el', 'los', 'las', 'del', 'al', 'en', 'por', 'con', 'para'];
    if (nombreCliente) {
      // Divide el nombre en palabras y filtra las palabras excluidas
      const palabras = nombreCliente.split(' ').filter((palabra: string) => !palabrasExcluidas.includes(palabra.toLowerCase()));
      // Toma las iniciales de las palabras restantes
      nombreCliente = palabras.map((palabra: string) => palabra.charAt(0).toUpperCase()).join('');
    }
    //console.log('****', nombreCliente );
    // Aquí puedes realizar acciones adicionales, como actualizar otros campos del formulario
    
  }
  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.geocodingService.searchAddress(query).subscribe({
      next: (results) => {
        this.suggestions = results;
      },
      error: (error) => {
        console.error('Error en autocompletar:', error);
      },
    });
  }

  onOptionSelected(event: any): void {
    const selectedAddress = this.suggestions.find(
      (s) => s.display_name === event.option.value
    );
    if (selectedAddress) {
      this.localForm.patchValue({
        direccion: selectedAddress.display_name,
        latitud: selectedAddress.lat,
        longitud: selectedAddress.lon,
      });
    }
  }
  onCancelar() {
    this.router.navigate(['/mantenedores/locales']);
  }
}
