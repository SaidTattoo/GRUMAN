import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
interface Usuario {
  id: number;
  name: string;
  email: string;
}
const ELEMENT_DATA: Usuario[] = [
  {id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com'},
  {id: 2, name: 'María García', email: 'maria.garcia@example.com'},
  // Agrega más datos según sea necesario
];
@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class ReusableTableComponent<T> implements OnInit {
  @Input() displayedColumns: string[] = [];
  @Input() data: T[] = [];

  dataSource: MatTableDataSource<T> = new MatTableDataSource<T>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<T>(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  trackByFn(index: number, item: T): any {
    return (item as any).id || index;
  }

  editar(element: T) {
    // Lógica para editar
  }

  eliminar(element: T) {
    // Lógica para eliminar
  }
}
