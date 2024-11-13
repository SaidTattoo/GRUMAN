import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SectoresService } from 'src/app/services/sectores.service';

@Component({
  selector: 'app-crear-sector-default',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './crear-sector-default.component.html',
  styleUrl: './crear-sector-default.component.scss'
})
export class CrearSectorDefaultComponent {
  sectorForm: FormGroup;
  constructor(private fb: FormBuilder, private sectoresService: SectoresService){
    this.sectorForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  onSubmit(){
    console.log(this.sectorForm.value);
    this.sectoresService.createSectorDefault(this.sectorForm.value).subscribe(res => {
      console.log(res);
    });
  }
}
