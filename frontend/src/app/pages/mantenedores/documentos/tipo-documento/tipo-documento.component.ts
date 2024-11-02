import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { TipoDocumento } from 'src/app/interfaces/tipoDocumento.interface';
import { DocumentosService } from 'src/app/services/documentos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tipo-documento',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './tipo-documento.component.html',
  styleUrl: './tipo-documento.component.scss'
})

export class TipoDocumentoComponent {


  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  dataSource = new MatTableDataSource<TipoDocumento>();

  constructor(private documentosService: DocumentosService, private router: Router) {}
  ngOnInit(): void {
    this.getTipoDocumentos();
  }

  getTipoDocumentos() {
    
    this.documentosService.getTipoDocumentos().subscribe(data => {
      this.dataSource.data = data;
      console.log(this.dataSource.data);
    });
  }
  createTipoDocumento() {
    this.router.navigate(['/mantenedores/documentos/crear-tipo-documento']);
  }
  deleteTipoDocumento(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentosService.deleteTipoDocumento(id).subscribe(data => {
          this.getTipoDocumentos();
        });
      }
    });
  }
}
