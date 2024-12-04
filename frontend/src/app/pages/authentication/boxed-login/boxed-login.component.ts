import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';
import { MaterialModule } from '../../../material.module';
import { StorageService } from '../../../services/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-boxed-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './boxed-login.component.html',
})
export class AppBoxedLoginComponent implements OnInit {
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService, 
    private router: Router, 
    private authService: AuthService,
    private storage: StorageService
  ) { }

  form = new FormGroup({
    email: new FormControl('administrador@gmail.com', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('123456789', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void { }  

  submit() {
    if (this.form.valid) {
      const email = this.form.value.email || '';
      const password = this.form.value.password || '';
      
      this.authService.login(email, password).subscribe(
        (response) => {
          this.storage.setItem('token', response.token);
          
          // Transformar clientes a companies
          const userWithCompanies = {
            ...response.user,
            companies: response.user.clientes
          };
          delete userWithCompanies.clientes;
          
          this.storage.setItem('currentUser', userWithCompanies);
          
          const companies = userWithCompanies.companies || [];
          if (companies.length > 1) {
            this.router.navigate(['/auth/select-client']);
          } else {
            this.router.navigate(['/dashboards/dashboard1']);
          }
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Credenciales incorrectas!'
          });
        }
      );
    } 
  }
}
