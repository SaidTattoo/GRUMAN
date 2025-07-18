import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivoFijoLocalService } from 'src/app/services/activo-fijo-local.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { InspectionService } from 'src/app/services/inspection.service';
import { LocalesService } from 'src/app/services/locales.service';
import { TipoActivoService } from 'src/app/services/tipo-activo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-activo-fijo-local',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule
  ],
  templateUrl: './editar-activo-fijo-local.component.html',
  styleUrl: './editar-activo-fijo-local.component.scss'
})
export class EditarActivoFijoLocalComponent implements OnInit {
  form: FormGroup;
  clientes: any[] = [];
  locales: any[] = [];
  tipoActivo: any[] = [];
  onOffInverter: any[] = ['On-off', 'Inverter'];
  sections: any[] = [];

  // Getter para verificar si el checklist es requerido
  get requiresChecklist(): boolean {
    return this.form.get('require_checklist')?.value || false;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clienteService: ClientesService,
    private localesService: LocalesService,
    private tipoActivoService: TipoActivoService,
    private activoFijoLocalService: ActivoFijoLocalService,
    private route: ActivatedRoute,
    private inspectionService: InspectionService
  ) {
    this.form = this.fb.group({
      client: ['', Validators.required],
      locales: ['', Validators.required],
      tipoActivo: ['', Validators.required],
      tipo_equipo: ['', Validators.required],
      marca: ['', Validators.required],
      potencia_equipo: ['', Validators.required],
      refrigerante: ['', Validators.required],
      on_off_inverter: ['', Validators.required],
      suministra: ['', Validators.required],
      codigo_activo: ['', Validators.required],
      require_checklist: [false],
      sectionId: [{ value: null, disabled: true }],
    });
  }


  ngOnInit(): void {
    this.activoFijoLocalService.getById(this.route.snapshot.params['id']).subscribe(data => {
      console.log('Datos del backend:', data); // Debug log
      // Procesar los datos antes de asignarlos al formulario
      const formValues = {
        ...data,
        client: data.client?.id, // Asegúrate de asignar solo el ID del cliente
        locales: data.locales?.id, // Asegúrate de asignar solo el ID del local
        tipoActivo: data.tipoActivo?.id, // Asegúrate de asignar solo el ID del tipo de activo
        on_off_inverter: this.onOffInverter.find(option => option === data.on_off_inverter) || null, // Validar el valor del dropdown
        require_checklist: data.require_checklist || false,
        sectionId: data.sectionId || data.section?.id || null,
      };
      console.log('Valores procesados:', formValues); // Debug log
      this.form.patchValue(formValues); // Asigna los valores procesados
      
      // Aplicar la lógica condicional del checklist después de cargar los datos
      const requireChecklistControl = this.form.get('require_checklist');
      const checklistIdControl = this.form.get('sectionId');
      
      if (formValues.require_checklist) {
        checklistIdControl?.enable();
        checklistIdControl?.setValidators([Validators.required]);
      } else {
        checklistIdControl?.disable();
        checklistIdControl?.clearValidators();
      }
      checklistIdControl?.updateValueAndValidity();
    });

    this.getClientes();
    this.getTipoActivo();
    this.getChecklist();

    this.setupFormSubscriptions();
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = { 
        ...this.form.getRawValue(),
        id: this.route.snapshot.params['id']
      };
      
      this.activoFijoLocalService.actualizar(formData).subscribe({
        next: (data: any) => {
          Swal.fire({
            title: 'Activo fijo local actualizado',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.router.navigate(['/mantenedores/activo-fijo-local']);
          });
        },
        error: (error: any) => {
          console.error('Error al actualizar:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el activo fijo local',
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
      });
    }
  }

  onCancel() {
    this.router.navigate(['/mantenedores/activo-fijo-local']);
  }

  getClientes() {
    this.clienteService.getClientes().subscribe(data => {
      /* devolver clientes pero no incluir GRUMAN */
      const clientes = data.filter(cliente => cliente.id !== 5);
      this.clientes = clientes;
    });
  }
  getLocales(clientId: number): void {
    this.localesService.getLocalesByCliente(clientId).subscribe({
      next: (data: any) => {
        this.locales = data;
        //console.log('Locales:', this.locales); // Verifica que los locales se cargan correctamente
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los locales' });
      }
    });
  }

  getTipoActivo() {
    this.tipoActivoService.getTiposActivo().subscribe(data => {
      this.tipoActivo = data;
    });
  }

  getChecklist(): void {
    this.inspectionService.getSections().subscribe({
      next: (sections) => {
        this.sections = sections;
      }
    });
  }

  private setupFormSubscriptions(): void {
    // Escucha cambios en el cliente para actualizar los locales
    this.form.get('client')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        this.getLocales(clientId);
      }
    });

    // Lógica para habilitar/deshabilitar sectionId basado en require_checklist
    this.form.get('require_checklist')?.valueChanges.subscribe((requireChecklist: boolean) => {
      const checklistIdControl = this.form.get('sectionId');
      
      if (requireChecklist) {
        checklistIdControl?.enable();
        checklistIdControl?.setValidators([Validators.required]);
      } else {
        checklistIdControl?.disable();
        checklistIdControl?.clearValidators();
        checklistIdControl?.setValue(null);
      }
      checklistIdControl?.updateValueAndValidity();
    });
  }
}
