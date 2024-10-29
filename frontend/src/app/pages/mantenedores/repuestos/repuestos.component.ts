import { JsonPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RepuestosService } from 'src/app/services/repuestos.service';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [JsonPipe,MatTableModule,MatPaginatorModule,MatSortModule,MatCardModule],
  templateUrl: './repuestos.component.html',
  styleUrl: './repuestos.component.scss'
})
export class RepuestosComponent {
  displayedColumns: string[] = ['id', 'familia', 'articulo', 'marca', 'precio'];
  dataSource = new MatTableDataSource<any>();
  repuestos:any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private repuestosService: RepuestosService) {}

  ngOnInit() {
    this.repuestosService.getRepuestos().subscribe((data) => {
      this.repuestos = data;
      console.log('--->', this.repuestos);
      this.dataSource = new MatTableDataSource(this.repuestos);
    });
  }
}
