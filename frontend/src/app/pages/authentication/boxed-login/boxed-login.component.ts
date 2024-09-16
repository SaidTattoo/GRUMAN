import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-boxed-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './boxed-login.component.html',
})
export class AppBoxedLoginComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService, private router: Router, private authService: AuthService) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('contraseñaSegura', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.valid) {
      const email = this.form.value.email || '';
      const password = this.form.value.password || '';
      this.authService.login(email, password).subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboards/dashboard1']);
        },
        (error) => {
          console.error('Login failed', error);
        }
      );
    }
  }
}
