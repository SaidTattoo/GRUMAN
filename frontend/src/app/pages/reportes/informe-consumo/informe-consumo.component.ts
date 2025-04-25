import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';

import { AsyncPipe } from '@angular/common';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';

export interface ConsumoData {
  requerimiento: string;
  servicio: string;
  local: string;
  repuesto: string;
  cliente: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  valor: number;
  fecha: Date;
  visitaTecnico: string;
}

@Component({
  selector: 'app-informe-consumo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatPaginatorModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideNativeDateAdapter()
  ],
  templateUrl: './informe-consumo.component.html',
  styleUrl: './informe-consumo.component.scss'
})
export class InformeConsumoComponent implements OnInit {
  constructor(private storage: StorageService) { }

  private user: any;
  private storageSubscription: Subscription;

  dataSource = new MatTableDataSource<ConsumoData>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  firstControl = new FormControl('');
  firstoption: string[] = [];
  filteredOptions: Observable<string[]>;
  options: string[] = ['Cliente 1', 'Cliente 2', 'Cliente 3'];

  displayedColumns: string[] = [
    'requerimiento',
    'servicio',
    'local',
    'repuesto',
    'cliente',
    'cantidad',
    'precioCompra',
    'precioVenta',
    'valor',
    'fecha',
    'visitaTecnico'
  ];

  startDate = new Date();
  endDate = new Date();

  ngOnInit() {
    this.storageSubscription = this.storage.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.firstoption = this.user.companies.map((company: any) => company.nombre.toLowerCase() === 'gruman' ? 'TODOS' : company.nombre);
      }
    });
    // first option
    this.filteredOptions = this.firstControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
    this.loadSampleData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  private loadSampleData() {
    const sampleData: ConsumoData[] = [
      {
        requerimiento: 'REQ001',
        servicio: 'Mantenimiento',
        local: 'Local 1',
        repuesto: 'Repuesto A',
        cliente: 'Cliente 1',
        cantidad: 2,
        precioCompra: 100,
        precioVenta: 150,
        valor: 300,
        fecha: new Date(),
        visitaTecnico: 'Técnico 1'
      },
      // Agrega más datos de ejemplo según sea necesario
    ];
    this.dataSource.data = sampleData;
  }
}
