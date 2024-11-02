import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { DocumentosService } from 'src/app/services/documentos.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    PdfViewerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './documentos.component.html',
  styleUrl: './documentos.component.scss'
})
export class DocumentosComponent {
  filterForm: FormGroup;
  tipos: string[] = ['clientes', 'vehiculos', 'tecnicos', 'repuestos']; // Reemplaza con tus tipos reales
  tiposDocumento: string[] = []; // Reemplaza con tus tipos de documento reales
  dataSource = new MatTableDataSource<any>();
  filteredDataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [ 'nombre', 'tipo' , 'tipoDocumento', 'fechaCreacion', 'estado'];
  pdfSrc: string | null = null;
  isPdfVisible: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router, private documentosService: DocumentosService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      nombre: [''],
      tipo: [''],
      tipoDocumento: ['']
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  

  ngOnInit(): void {
    this.getDocumentos();
    this.getTipoDocumentos();
  }


  getTipoDocumentos() {
    this.documentosService.getTipoDocumentos().subscribe(data => {
      this.tiposDocumento = data.map(tipo => tipo.nombre);
    });
  }

  getDocumentos() {
    this.documentosService.getDocumentos().subscribe(data => {
      this.dataSource.data = data;
      this.filteredDataSource.data = data;
      this.filteredDataSource.paginator = this.paginator;
    });
  }

  subirDocumento() {
    this.router.navigate(['/mantenedores/documentos/subir-documento']);
  }

  toggleDocumento(url: string) {
    if (this.pdfSrc === url && this.isPdfVisible) {
      this.isPdfVisible = false;
      this.pdfSrc = null;
    } else {
      this.pdfSrc = url;
      this.isPdfVisible = true;
    }
  }

  applyFilter() {
    const { nombre, tipo, tipoDocumento } = this.filterForm.value;
    this.filteredDataSource.data = this.dataSource.data.filter(doc => {
      return (!nombre || doc.nombre.toLowerCase().includes(nombre.toLowerCase())) &&
             (!tipo || doc.tipo === tipo) &&
             (!tipoDocumento || doc.tipoDocumento?.nombre === tipoDocumento);
    });
  }
  clearFilters() {
    this.filterForm.reset();
    this.filteredDataSource.data = this.dataSource.data;
  }
}
