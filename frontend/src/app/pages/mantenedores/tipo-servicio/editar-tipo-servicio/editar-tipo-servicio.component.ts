import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-tipo-servicio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './editar-tipo-servicio.component.html',
  styleUrl: './editar-tipo-servicio.component.scss'
})
export class EditarTipoServicioComponent implements OnInit {
  tipoServicio: FormGroup;
  servicio: any;
  
  constructor(private fb: FormBuilder, 
              private tipoServicioService: TipoServicioService, 
              private router: Router, 
              private route: ActivatedRoute) {
    this.tipoServicio = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.tipoServicioService.findById(this.route.snapshot.params['id']).subscribe((data) => {
      this.servicio = data;
      this.tipoServicio.patchValue({
        nombre: this.servicio.nombre
      });
    });
  }

  updateTipoServicio(){
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Los datos no se pueden modificar una vez guardados.",
      icon: 'warning',
      showCancelButton: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (this.tipoServicio.valid) {
          this.tipoServicioService.updateTipoServicio(this.servicio.id, this.tipoServicio.value).subscribe((data) => {
            this.router.navigate(['/mantenedores/tipo-servicio']);
          });
        }
      }
    });
  }


  onCancel(){
    this.router.navigate(['/mantenedores/tipo-servicio/']);
  }
}
