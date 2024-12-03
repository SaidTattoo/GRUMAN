import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ServiciosRealizadosService } from 'src/app/services/servicios-realizados.service';
import { ServiciosService } from 'src/app/services/servicios.service';

@Component({
  selector: 'app-servicios-realizados',
  standalone: true,
  imports: [  CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule,
     FormsModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatButtonModule 
    ],
  templateUrl: './servicios-realizados.component.html',
  styleUrl: './servicios-realizados.component.scss'
})
export class ServiciosRealizadosComponent implements OnInit {
  programacionForm: FormGroup;
  tiposServicio: any[] = [];
  tiposSolicitud: any[] = [
    {id: 1, nombre: 'Todos'},
    {id: 2, nombre: 'Normal'},
    {id: 3, nombre: 'Urgente'},
    {id: 4, nombre: 'Critico'},
    {id: 5, nombre: 'Programación'},
  ];
  meses: any[] = [];
  constructor(private fb: FormBuilder, private serviciosService: ServiciosService, private serviciosRealizadosService: ServiciosRealizadosService, private router: Router) {
    this.programacionForm = this.fb.group({
      tipoServicio: [null, Validators.required],
      tipoSolicitud: [null, Validators.required],
      diaSeleccionadoInicio: [null, Validators.required],
      diaSeleccionadoTermino: [null, Validators.required],
      mesFacturacion: [null, Validators.required],
      tipoBusqueda: [null, Validators.required],
    }, { validators: this.fechaTerminoMayorQueInicio });
  }

  fechaTerminoMayorQueInicio(control: AbstractControl): ValidationErrors | null {
    const inicio = control.get('diaSeleccionadoInicio')?.value;
    const termino = control.get('diaSeleccionadoTermino')?.value;

    if (inicio && termino && termino < inicio) {
      return { fechaTerminoMayorQueInicio: true };
    }
    return null;
  }

  ngOnInit(): void {

    this.getTiposServicio();
    this.getTiposSolicitud();
    this.getMeses();
  }

  onSubmit() {
    if (this.programacionForm.invalid) {
      //console.log('Formulario inválido');
      return;
    }
    const formData = this.programacionForm.value;
    formData.diaSeleccionadoInicio = new Date(formData.diaSeleccionadoInicio).toISOString().split('T')[0];
    formData.diaSeleccionadoTermino = new Date(formData.diaSeleccionadoTermino).toISOString().split('T')[0];
    this.serviciosRealizadosService.create(formData).subscribe((data: any) => {
      this.router.navigate(['/transacciones/lista-servicios-realizados']);
    });
  }
  getMeses(){
    /* los meses deben ser rango de el mes actual hasta 10 años atras quiero visualizar mes y año */
    /* ejemplo Noviembre 2024  */
    /**
     * en orden descendente
     */
    const fechaActual = new Date();
    const fecha10AnosAtras = new Date(fechaActual.getFullYear() - 10, fechaActual.getMonth(), 1);
    const meses = [];
    for (let mes = fechaActual; mes >= fecha10AnosAtras; mes.setMonth(mes.getMonth() - 1)) {
      meses.push({ id: mes.getMonth() + 1, nombre: mes.toLocaleString('default', { month: 'long' }) + ' ' + mes.getFullYear() });
    }
    this.meses = meses;
  } 

  getTiposServicio() {
    this.serviciosService.getAllServicios().subscribe((data: any) => {
      this.tiposServicio = data;
    });
  }

  getTiposSolicitud() {

  }

  
}
