import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-solicitar-visita',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule],
  templateUrl: './solicitar-visita.component.html',
  styleUrl: './solicitar-visita.component.scss',
  providers: [
    provideNativeDateAdapter()
  ],
})
export class SolicitarVisitaComponent {
  selectedFileName: string | null = null;
  locales: any[] = [];
  sectores: any[] = [];

  visitaForm = new FormGroup({
    tipoServicio: new FormControl('', Validators.required),
    localId: new FormControl('', Validators.required),
    fechaIngreso: new FormControl('', Validators.required),
    ticketGruman: new FormControl('', Validators.required),
    file: new FormControl('', Validators.required), 
    sectorTrabajo: new FormControl('', Validators.required),
    especialidad: new FormControl('', Validators.required),
    descripcionTrabajo: new FormControl('', Validators.required),
    fechaVisita: new FormControl('', Validators.required),
    horaVisita: new FormControl('', Validators.required),
    observaciones: new FormControl('', Validators.required),

  });

  onSubmit() {
    //console.log(this.visitaForm.value);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFileName = file.name;
  }
}
