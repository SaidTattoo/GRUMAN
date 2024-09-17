import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LocalesService } from 'src/app/services/locales.service';

@Component({
  selector: 'app-crear-local',
  templateUrl: './crear-local.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule],
  styleUrls: ['./crear-local.component.scss']
})
export class CrearLocalComponent implements OnInit {
  localForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private localesService: LocalesService
  ) { }

  ngOnInit(): void {
    this.localForm = this.fb.group({
      direccion: ['', Validators.required],
      comuna: ['', Validators.required],
      region: ['', Validators.required],
      zona: ['', Validators.required],
      grupo: ['', Validators.required],
      referencia: ['', Validators.required],
      telefono: ['', Validators.required],
      email_local: ['', [Validators.required, Validators.email]],
      email_encargado: ['', [Validators.required, Validators.email]],
      nombre_encargado: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.localForm.valid) {
      console.log(this.localForm.value);
      this.localesService.crearLocal(this.localForm.value).subscribe((data) => {
        console.log(data);
      });
    }
  }
}
