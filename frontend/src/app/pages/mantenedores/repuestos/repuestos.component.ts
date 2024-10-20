import { JsonPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RepuestosService } from 'src/app/services/repuestos.service';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [JsonPipe],
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
    });
  }
}
