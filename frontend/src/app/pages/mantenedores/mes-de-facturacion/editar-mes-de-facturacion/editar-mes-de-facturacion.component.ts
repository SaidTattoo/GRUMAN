import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { MatSelectModule } from '@angular/material/select';
import { FacturacionService } from 'src/app/services/facturacion.service';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

interface Facturacion {
  id_facturacion: number;
  fecha_inicio: string;
  fecha_termino: string;
  mes: string;
}

@Component({
  selector: 'app-editar-mes-de-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: true } },
    { provide: MAT_DATE_LOCALE, useValue: 'es' }
  ],
  templateUrl: './editar-mes-de-facturacion.component.html',
  styleUrls: ['./editar-mes-de-facturacion.component.scss']
})
export class EditarMesDeFacturacionComponent implements OnInit {
  form: FormGroup;
  id: number;
  facturaciones: any = {
    meses: []
  };
  fechaInicioPreview: Date | null = null;
  fechaFinPreview: Date | null = null;
  diaSugerido: number | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientesService,
    private facturacionService: FacturacionService,
    public router: Router,
    private route: ActivatedRoute,
    private dateAdapter: DateAdapter<any>
  ) {
    this.dateAdapter.setLocale('es');
    moment.locale('es');
    
    this.form = this.fb.group({
      mesFacturacion: ['', Validators.required],
      diaInicio: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
      diaFin: ['', [Validators.required, Validators.min(1), Validators.max(31)]]
    });

    // Suscribirse a los cambios del día de inicio
    this.form.get('diaInicio')?.valueChanges.subscribe(diaInicio => {
      if (diaInicio) {
        this.sugerirDiaFin(diaInicio);
        this.actualizarPreview();
      }
    });

    // Suscribirse a los cambios del día fin
    this.form.get('diaFin')?.valueChanges.subscribe(() => {
      this.actualizarPreview();
    });

    // Suscribirse a los cambios del mes
    this.form.get('mesFacturacion')?.valueChanges.subscribe(selectedValue => {
      if (selectedValue) {
        const fechaInicio = moment(selectedValue.fecha_inicio);
        this.form.patchValue({
          diaInicio: fechaInicio.date()
        });
        this.actualizarPreview();
      }
    });
  }

  sugerirDiaFin(diaInicio: number) {
    const selectedMes = this.form.get('mesFacturacion')?.value;
    if (selectedMes && diaInicio) {
      const fechaInicio = moment(selectedMes.fecha_inicio).date(diaInicio);
      const fechaFin = moment(fechaInicio).add(30, 'days');
      this.diaSugerido = fechaFin.date();
      
      // Establecer el día sugerido como valor inicial, pero permitir que sea modificado
      this.form.patchValue({
        diaFin: this.diaSugerido
      }, { emitEvent: false }); // evitar ciclo infinito
    }
  }

  actualizarPreview() {
    const selectedMes = this.form.get('mesFacturacion')?.value;
    const diaInicio = this.form.get('diaInicio')?.value;
    const diaFin = this.form.get('diaFin')?.value;
    
    if (selectedMes && diaInicio && diaFin) {
      const fechaInicio = moment(selectedMes.fecha_inicio).date(diaInicio);
      const fechaFin = moment(selectedMes.fecha_inicio).date(diaFin);
      
      // Si el día de fin es menor que el de inicio, avanzar al siguiente mes
      if (diaFin < diaInicio) {
        fechaFin.add(1, 'month');
      }
      
      this.fechaInicioPreview = fechaInicio.toDate();
      this.fechaFinPreview = fechaFin.toDate();
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.clientService.getCliente(this.id).subscribe({
          next: (client: any) => {
            if (client && client.facturaciones) {
              this.facturaciones.meses = client.facturaciones.map((fac: any) => ({
                value: {
                  id_facturacion: Number(fac.id_facturacion),
                  fecha_inicio: fac.fecha_inicio,
                  fecha_termino: fac.fecha_termino,
                  mes: fac.mes
                },
                viewValue: fac.mes
              }));
            }
          },
          error: (error: any) => {
            console.error('Error al cargar el cliente:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo cargar la información del cliente',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  submit() {
    if (this.form.valid) {
      const selectedMes = this.form.get('mesFacturacion')?.value;
      const diaInicio = this.form.get('diaInicio')?.value;
      const diaFin = this.form.get('diaFin')?.value;
      
      // Mantener el mismo mes y año para inicio, y ajustar el fin si es necesario
      const fechaInicio = moment(selectedMes.fecha_inicio).date(diaInicio);
      const fechaFin = moment(selectedMes.fecha_inicio).date(diaFin);
      
      // Si el día de fin es menor que el de inicio, avanzar al siguiente mes
      if (diaFin < diaInicio) {
        fechaFin.add(1, 'month');
      }

      const formData = {
        fecha_inicio: fechaInicio.format('YYYY-MM-DD'),
        fecha_termino: fechaFin.format('YYYY-MM-DD')
      };

      console.log('Datos a enviar:', formData);

      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas actualizar los días de facturación?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.facturacionService.updateMesDeFacturacion(
            selectedMes.id_facturacion,
            formData
          ).subscribe({
            next: (response) => {
              console.log('Respuesta del servidor:', response);
              Swal.fire({
                title: '¡Actualizado!',
                text: 'Los días de facturación han sido actualizados.',
                icon: 'success',
                timer: 500,
                showConfirmButton: false
              }).then(() => {
                this.router.navigate(['/mantenedores/mes-de-facturacion']);
              });
            },
            error: (error) => {
              console.error('Error al actualizar:', error);
              Swal.fire({
                title: 'Error',
                text: 'Hubo un error al actualizar los días de facturación. Detalles: ' + (error.message || error),
                icon: 'error'
              });
            }
          });
        }
      });
    }
  }
}
