
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { DocumentosService } from 'src/app/services/documentos.service';

@Component({
  selector: 'app-crear-tipo-documento',
  standalone: true,
  imports: [CommonModule, MatCardModule,ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './crear-tipo-documento.component.html',
  styleUrl: './crear-tipo-documento.component.scss'
})
export class CrearTipoDocumentoComponent {
  tipoDocumentoForm: FormGroup;
  constructor( private tipoDocumentoService: DocumentosService, private router: Router ) {
    this.tipoDocumentoForm = new FormGroup({
      nombre: new FormControl('', [Validators.required])
    });
  }

  createTipoDocumento() {
    console.log(this.tipoDocumentoForm.value);
    this.tipoDocumentoService.createTipoDocumento(this.tipoDocumentoForm.value).subscribe(response => {
      console.log(response);
      this.router.navigate(['/mantenedores/documentos/tipo-documento']);
    });
  }
}
