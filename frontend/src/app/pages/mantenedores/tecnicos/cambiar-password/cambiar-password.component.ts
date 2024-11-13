import { S } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [FormsModule, MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.scss'
})
export class CambiarPasswordComponent implements OnInit {
  form: FormGroup;
  tecnico: any;
  password: string = '';
  password2: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      password: ['', Validators.required],
      password2: ['', Validators.required]
    }, { validator: this.passwordsMatchValidator });
  }



  ngOnInit() {
    this.tecnico = this.route.snapshot.params['tecnico'];

  }
  passwordsMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password2')?.value ? null : { mismatch: true };
  }
  onCancel() {
    this.router.navigate(['/mantenedores/tecnicos']);
  }
  cambiarPassword() {
    if (this.form.valid) {
      const password = this.form.get('password')?.value;
      this.authService.changePassword(this.tecnico, password).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña cambiada correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.router.navigate(['/mantenedores/tecnicos']);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Las contraseñas no coinciden!'
      });
    }
  }

}
