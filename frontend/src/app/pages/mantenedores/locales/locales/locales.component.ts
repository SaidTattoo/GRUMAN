import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LocalesService } from 'src/app/services/locales.service';
import { CrearLocalComponent } from '../crear-local/crear-local.component';
import { MatDialog } from '@angular/material/dialog';
const ELEMENT_DATA: any[] = [
  {
    id: 1,
    imagePath: 'assets/images/profile/user-1.jpg',
    uname: 'Sunil Joshi',
    position: 'Web Designer',
    productName: 'Elite Admin',
    budget: 3.9,
    priority: 'low',
  },
  {
    id: 2,
    imagePath: 'assets/images/profile/user-2.jpg',
    uname: 'Andrew McDownland',
    position: 'Project Manager',
    productName: 'Real Homes Theme',
    budget: 24.5,
    priority: 'medium',
  },
  {
    id: 3,
    imagePath: 'assets/images/profile/user-3.jpg',
    uname: 'Christopher Jamil',
    position: 'Project Manager',
    productName: 'MedicalPro Theme',
    budget: 12.8,
    priority: 'high',
  },
  {
    id: 4,
    imagePath: 'assets/images/profile/user-4.jpg',
    uname: 'Nirav Joshi',
    position: 'Frontend Engineer',
    productName: 'Hosting Press HTML',
    budget: 2.4,
    priority: 'critical',
  },
];
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
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  ngOnInit(): void {
    this.localesService.getLocales().subscribe((data) => {
      this.dataSource = data;
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
