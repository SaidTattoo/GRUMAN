import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ClientesService } from 'src/app/services/clientes.service';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import Swal from 'sweetalert2';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-editar-cliente-usuario',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatListModule
  ],
  styleUrls: ['../cliente-usuarios.component.scss'],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-content class="p-24">
        <form [formGroup]="clienteUsuarioForm" (ngSubmit)="onSubmit()">
          <!-- Perfil -->
          <div class="row">
            <div class="col-sm-4 d-flex align-items-center">
              <mat-label class="mat-subtitle-2 f-w-600 d-block m-b-16">Perfil</mat-label>
            </div>
            <div class="col-sm-8">
              <mat-form-field appearance="outline" class="w-100">
                <mat-select formControlName="perfil" placeholder="Seleccionar Perfil">
                  @for (perfil of perfiles; track perfil) {
                    <mat-option [value]="perfil">
                      {{ perfil }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Nombre -->
          <div class="row">
            <div class="col-sm-4 d-flex align-items-center">
              <mat-label class="mat-subtitle-2 f-w-600 d-block m-b-16">Nombre</mat-label>
            </div>
            <div class="col-sm-8">
              <mat-form-field appearance="outline" class="w-100">
                <input matInput formControlName="name" placeholder="Ingrese Nombre">
              </mat-form-field>
            </div>
          </div>

          <!-- Apellido -->
          <div class="row">
            <div class="col-sm-4 d-flex align-items-center">
              <mat-label class="mat-subtitle-2 f-w-600 d-block m-b-16">Apellido</mat-label>
            </div>
            <div class="col-sm-8">
              <mat-form-field appearance="outline" class="w-100">
                <input matInput formControlName="lastName" placeholder="Ingrese Apellido">
              </mat-form-field>
            </div>
          </div>

          <!-- Email -->
          <div class="row">
            <div class="col-sm-4 d-flex align-items-center">
              <mat-label class="mat-subtitle-2 f-w-600 d-block m-b-16">Email</mat-label>
            </div>
            <div class="col-sm-8">
              <mat-form-field appearance="outline" class="w-100">
                <input matInput formControlName="email" placeholder="Ingrese Email">
              </mat-form-field>
            </div>
          </div>

          <!-- RUT -->
          <div class="row">
            <div class="col-sm-4 d-flex align-items-center">
              <mat-label class="mat-subtitle-2 f-w-600 d-block m-b-16">RUT</mat-label>
            </div>
            <div class="col-sm-8">
              <mat-form-field appearance="outline" class="w-100">
                <input matInput formControlName="rut" placeholder="Ingrese RUT">
              </mat-form-field>
            </div>
          </div>

          <!-- Selección de Clientes -->
          <mat-label class="mat-subtitle-2 f-w-600 d-block m-b-16 text-center">Seleccionar cliente/s</mat-label>
          <div class="client-grid">
            @for (cliente of clientes; track cliente.id) {
              <div class="client-item-container">
                <div
                  (click)="toggleClientSelection(cliente.id)"
                  [class.selected]="selectedClientIds.includes(cliente.id)"
                  class="client-item"
                >
                  <img [src]="cliente.logo" alt="Foto del Cliente" />
                </div>
                <div class="client-name text-center mt-2">{{ cliente.nombre }}</div>
              </div>
            }
          </div>

          <!-- Botones -->
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button mat-button type="button" (click)="onCancel()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!isFormValid()">
              Guardar
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .client-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;
      padding: 20px;
      justify-items: center;
      align-items: start;
    }

    .client-item-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 150px;
    }

    .client-item {
      width: 150px;
      height: 150px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 3px solid transparent;
      padding: 10px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }

      &.selected {
        border-color: #1e88e5;
        box-shadow: 0 0 15px rgba(30,136,229,0.3);
      }

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .client-name {
      margin-top: 8px;
      font-size: 14px;
      color: rgba(0,0,0,0.87);
      font-weight: 500;
    }

    // Responsive adjustments
    @media (max-width: 768px) {
      .client-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
      }

      .client-item-container {
        width: 120px;
      }

      .client-item {
        width: 120px;
        height: 120px;
      }
    }
  `]
})
export class EditarClienteUsuarioComponent implements OnInit {
  clienteUsuarioForm: FormGroup;
  clientes: any[] = [];
  perfiles = ['user', 'reporter', 'admin', 'superadmin'];
  selectedClientIds: number[] = [];
  userId: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private tecnicosService: TecnicosService,
    private storage: StorageService,
    private authService: AuthService,
    private usersService: UsersService
  ) {
    this.clienteUsuarioForm = this.fb.group({
      perfil: ['', Validators.required],
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rut: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadClientes();
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.loadUsuario();
    });
  }

  loadClientes() {
    this.clientesService.getClientesWithGruman().subscribe((data: any) => {
      this.clientes = data;
    });
  }

  loadUsuario() {
    console.log('Cargando usuario:', this.userId);
    this.usersService.getUserById(this.userId).subscribe({
      next: (usuario: any) => {
        console.log('Usuario cargado:', usuario);
        this.clienteUsuarioForm.patchValue({
          perfil: usuario.profile,
          name: usuario.name,
          lastName: usuario.lastName,
          email: usuario.email,
          rut: usuario.rut
        });
        this.selectedClientIds = usuario.clients.map((client: any) => client.id);
      },
      error: (error) => {
        console.error('Error cargando usuario:', error);
        Swal.fire('Error', 'No se pudo cargar la información del usuario', 'error');
      }
    });
  }

  toggleClientSelection(clienteId: number): void {
    const index = this.selectedClientIds.indexOf(clienteId);
    if (index === -1) {
      this.selectedClientIds.push(clienteId);
    } else {
      this.selectedClientIds.splice(index, 1);
    }
  }

  isFormValid(): boolean {
    return this.clienteUsuarioForm.valid && this.selectedClientIds.length > 0;
  }

  onSubmit() {
    if (this.isFormValid()) {
      const formValues = this.clienteUsuarioForm.value;
      const userData = {
        ...formValues,
        clientId: this.selectedClientIds
      };

      this.tecnicosService.updateTecnico(this.userId, userData).subscribe({
        next: (updatedUser: any) => {
          const currentUser = this.storage.getItem('currentUser');
          console.log('Usuario actual:', currentUser); // Para debugging
          console.log('Usuario actualizado:', updatedUser); // Para debugging
          console.log('this.userId:', this.userId); // Para debugging
          console.log('currentUser.id:', currentUser?.id); // Para debugging
          console.log('Tipos de datos:', {
            userId: typeof this.userId,
            currentUserId: typeof currentUser?.id
          }); // Para debugging

          // Convertir ambos a número para la comparación
          if (currentUser && Number(currentUser.id) === Number(this.userId)) {
            console.log('Entrando a la actualización del usuario actual'); // Para debugging
            // Obtener la lista completa de clientes actualizada
            this.clientesService.getClientesWithGruman().subscribe((allClients: any[]) => {
              // Filtrar solo los clientes seleccionados
              const updatedCompanies = allClients.filter(client => 
                this.selectedClientIds.includes(client.id)
              );

              // Crear el usuario actualizado manteniendo todos los datos existentes
              const updatedCurrentUser = {
                ...currentUser,
                name: formValues.name,
                lastName: formValues.lastName,
                email: formValues.email,
                rut: formValues.rut,
                profile: formValues.perfil,
                companies: updatedCompanies,
                // Mantener la empresa seleccionada si aún está en la lista, si no, usar la primera
                selectedCompany: updatedCompanies.find(c => 
                  currentUser.selectedCompany?.id === c.id
                ) || updatedCompanies[0]
              };

              // Actualizar localStorage
              localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
              
              // Actualizar el storage service y emitir el cambio
              this.storage.setItem('currentUser', updatedCurrentUser);
              this.storage.updateUser(updatedCurrentUser);

              console.log('Usuario actualizado:', updatedCurrentUser); // Para debugging

              Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
              this.router.navigate(['/mantenedores/usuarios']);
            });
          } else {
            Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
            this.router.navigate(['/mantenedores/usuarios']);
          }
        },
        error: (error) => {
          console.error('Error actualizando usuario:', error);
          Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/mantenedores/usuarios']);
  }
} 