import { S } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [FormsModule, MatCardModule],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.scss'
})
export class CambiarPasswordComponent implements OnInit {
  form: FormGroup;
  tecnico: any;
  password: string = '';
  password2: string = '';

  constructor( private fb: FormBuilder, private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });
  }



  ngOnInit() {
    this.tecnico = this.route.snapshot.params['tecnico'];

  }
  comparePasswords() {
    return this.password === this.password2;
  }

  cambiarPassword() {
    if (this.comparePasswords()) {
      this.authService.changePassword(this.tecnico, this.password).subscribe((res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña cambiada correctamente',
          showConfirmButton: false,
          timer: 1500
        });

      });
      this.router.navigate(['/mantenedores/tecnicos']);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Las contraseñas no coinciden!'
      });
    }
  }

}
