import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

import Swal from 'sweetalert2';
import { SectoresService } from 'src/app/services/sectores.service';

@Component({
  selector: 'app-editar-sector-default',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  providers: [SectoresService],
  templateUrl: './editar-sector-default.component.html'
})
export class EditarSectorDefaultComponent implements OnInit {
  sectorForm: FormGroup;
  sectorId: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sectoresService: SectoresService
  ) {
    this.sectorForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sectorId = params['id'];
      this.loadSector();
    });
  }

  loadSector() {
    this.sectoresService.findOne(this.sectorId).subscribe({
      next: (sector: any) => {
        this.sectorForm.patchValue({
          nombre: sector.nombre
        });
      },
      error: (error: any) => {
        console.error('Error cargando sector:', error);
        Swal.fire('Error', 'No se pudo cargar la información del sector', 'error');
      }
    });
  }

  onSubmit() {
    if (this.sectorForm.valid) {
      this.sectoresService.updateSectorDefault(this.sectorId, this.sectorForm.value).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Sector actualizado correctamente', 'success');
          this.router.navigate(['/mantenedores/sectores-trabajo']);
        },
        error: (error: any) => {
          console.error('Error actualizando sector:', error);
          Swal.fire('Error', 'No se pudo actualizar el sector', 'error');
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/mantenedores/sectores-trabajo']);
  }
} 