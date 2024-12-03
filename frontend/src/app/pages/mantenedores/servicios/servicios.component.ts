import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ServiciosService } from 'src/app/services/servicios.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [MatTableModule, MatCardModule, ],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss'
})
export class ServiciosComponent implements OnInit {
  servicios: any[] = [];
  displayedColumns: string[] = [ 'nombre'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  constructor(private serviciosService: ServiciosService) { }

  ngOnInit(): void {
    this.serviciosService.getAllServicios().subscribe((data) => {
      this.servicios = data;
      this.dataSource = new MatTableDataSource(this.servicios);
    });
  
  }

  createServicio() {
    this.serviciosService.createServicio({ nombre: 'Nuevo Servicio' }).subscribe((data) => {
      this.servicios.push(data);
    });
  }

}
