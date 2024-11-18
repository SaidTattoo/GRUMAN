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
  tiposSolicitud: any[] = [];
  meses: any[] = [];
  constructor(private fb: FormBuilder, private serviciosService: ServiciosService) {
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
      console.log('Formulario inválido');
      return;
    }
    console.log(this.programacionForm.value);
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
