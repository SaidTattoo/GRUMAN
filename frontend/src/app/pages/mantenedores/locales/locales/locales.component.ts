import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LocalesService } from 'src/app/services/locales.service';
import { CrearLocalComponent } from '../crear-local/crear-local.component';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [CommonModule, MatCardModule  , MatTableModule , MatFormFieldModule , MatInputModule , MatButtonModule],
  templateUrl: './locales.component.html',
  styleUrl: './locales.component.scss'
})
export class LocalesComponent implements OnInit {

  constructor(private localesService: LocalesService, private dialog: MatDialog) { }
  displayedColumns: string[] = ['id', 'direccion', 'comuna', 'region', 'zona', 'grupo', 'referencia', 'telefono', 'email_local', 'email_encargado', 'nombre_encargado'];
  dataSource = new MatTableDataSource();

  ngOnInit(): void {
    this.localesService.getLocales().subscribe((data) => {
      this.dataSource = data;
      console.log(this.dataSource);
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  //AL CERRAR EL MODAL QUE ACTUALICE LA TABLA DE DATOS
  modalNuevoLocal(){
    const dialogRef = this.dialog.open(CrearLocalComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.ngOnInit();
    });
  }
}
