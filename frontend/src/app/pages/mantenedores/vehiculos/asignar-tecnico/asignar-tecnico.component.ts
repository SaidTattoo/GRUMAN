import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-asignar-tecnico',
  standalone: true,
  imports: [   CommonModule,
    MatCardModule, MatSelectModule , MatOptionModule, MatButtonModule, MatIconModule, ReactiveFormsModule ],
  templateUrl: './asignar-tecnico.component.html',
  styleUrl: './asignar-tecnico.component.scss'
})
export class AsignarTecnicoComponent implements OnInit {
  vehiculo: any = {};
  users: any[] = [];
  user: any;
  tecnicoForm: FormGroup;
  constructor(private vehiculosService: VehiculosService, private route: ActivatedRoute, private router: Router, private usersService: UsersService, private fb: FormBuilder) {
    this.tecnicoForm = this.fb.group({
      user: ['', Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vehiculosService.getVehiculoById(params['id']).subscribe(vehiculo => {
          this.vehiculo = vehiculo;
        });
      }
    });
  }
  ngOnInit(): void {
    this.getUsers();
  }
  formatPatente(patente: string | undefined): string {
    if (!patente) return '';
    return patente.replace(/(.{2})(?=.)/g, '$1<span class="dot">·</span>');
  }

  selectUser(event: any){
    this.user = event.value;
    console.log(this.user);
  }
  
  getUsers(){
    this.usersService.getAllTecnicos().subscribe((users:any) => {
      this.users = users;
      console.log(this.users);
    });
  }
  goBack(){
    this.router.navigate(['/mantenedores/vehiculos']);
  }

  asignarTecnico(){
    if (this.tecnicoForm.invalid) {
      return;
    }
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas asignar el técnico al vehículo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculosService.updateUserVehiculo(this.vehiculo.id, this.tecnicoForm.get('user')?.value).subscribe(() => {
          this.router.navigate(['/mantenedores/vehiculos']);
        });
      }
    });
  }
}