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
import { SectoresService } from 'src/app/services/sectores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-sector',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './crear-sector.component.html',
  styleUrl: './crear-sector.component.scss'
})
export class CrearSectorComponent implements OnInit {
  sectorForm: FormGroup;
  clientes: any[] = [];
  locales: any[] = [];

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private localesService: LocalesService,
    private sectoresTrabajoService: SectoresService,
    private router: Router
  ) {
    this.sectorForm = this.fb.group({
      cliente: ['', Validators.required],
      local: [{ value: '', disabled: true }, Validators.required],
      nombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.clientesService.getClientes().subscribe((data) => {
      //console.log('clientes',data);
      this.clientes = data;
    });
  }

  onClienteChange(event: any): void {
    const clienteId = event.value;
    this.localesService.getLocalesByCliente(clienteId).subscribe((data) => {
      this.locales = data;
      this.sectorForm.get('local')?.enable();
    });
  }

  onSubmit(): void {
    if (this.sectorForm.valid) {
      this.localesService.addSectorToLocal(this.sectorForm.value.local, this.sectorForm.value).subscribe(() => {
        Swal.fire({
          title: 'Éxito',
          text: 'Sector creado correctamente',
          icon: 'success'
        });
        this.router.navigate(['/mantenedores/sectores-trabajo']);
      });
    }
  }

  volver(): void {
    this.router.navigate(['/mantenedores/sectores-trabajo']);
  }
}
