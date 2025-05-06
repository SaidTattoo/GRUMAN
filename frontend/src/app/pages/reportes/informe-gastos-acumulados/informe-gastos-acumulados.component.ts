import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { InformeGastosAcumuladosService } from './informe-gastos-acumulados.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

interface TableRow {
  concepto: string;
  tipoMoneda: string;
  presupuestoMensual: number | null;
  acumulado: number | null;
  desviacion: number | null;
  isSummary?: boolean;
  isTotal?: boolean;
}

@Component({
  selector: 'app-informe-gastos-acumulados',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatPaginatorModule,
    CurrencyPipe,
    MatTooltipModule,
    MatSelectModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideNativeDateAdapter()
  ],
  templateUrl: './informe-gastos-acumulados.component.html',
  styleUrls: ['./informe-gastos-acumulados.component.scss']
})
export class InformeGastosAcumuladosComponent implements OnInit {
  informeForm: FormGroup;
  filteredOptions: Observable<string[]>;
  meses: any[] = [];
  displayedColumns: string[] = ['concepto', 'tipoMoneda', 'presupuestoMensual', 'acumulado', 'desviacion'];
  
  // Variables para el encabezado
  mesActual: string = '';
  valorUF: number = 39030;

  // Variables para datos de la tabla
  tableData: TableRow[] = [];

  // Variables adicionales
  private user: any;
  private storageSubscription: Subscription;
  private firstoption: string[] = [];
  private originalOptions: string[] = [];
  selectedCompanyName: string = '';

  constructor(
    private fb: FormBuilder,
    private storage: StorageService,
    private informeGastosAcumuladosService: InformeGastosAcumuladosService
  ) {
    this.informeForm = this.fb.group({
      cliente: ['', Validators.required],
      mesActual: ['', Validators.required]
    });

    this.filteredOptions = this.informeForm.get('cliente')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    // Inicializar los datos de la tabla
    this.initializeTableData();
  }

  ngOnInit() {
    this.storageSubscription = this.storage.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.firstoption = this.user.companies
          .filter((company: any) => company.nombre.toLowerCase() !== 'gruman')
          .map((company: any) => company.nombre);
        this.originalOptions = [...this.firstoption];
      }
    });

    this.initializeMeses();
  }

  private initializeTableData() {
    this.tableData = [
      {
        concepto: 'Valor Servicios',
        tipoMoneda: 'UF',
        presupuestoMensual: 1303.43,
        acumulado: 3.8,
        desviacion: -99.71
      },
      {
        concepto: 'Total Servicios (A)',
        tipoMoneda: '',
        presupuestoMensual: null,
        acumulado: 148314,
        desviacion: null,
        isSummary: true
      },
      {
        concepto: 'Correctivo',
        tipoMoneda: 'CLP',
        presupuestoMensual: 11000000,
        acumulado: 4321266,
        desviacion: -60.72
      },
      {
        concepto: 'Inversion',
        tipoMoneda: 'CLP',
        presupuestoMensual: 11000000,
        acumulado: 206919,
        desviacion: -98.12
      },
      {
        concepto: 'Reactivos RM',
        tipoMoneda: 'CLP',
        presupuestoMensual: 3000000,
        acumulado: 855206,
        desviacion: -71.49
      },
      {
        concepto: 'Reactivos Regiones',
        tipoMoneda: '',
        presupuestoMensual: null,
        acumulado: 0,
        desviacion: null
      },
      {
        concepto: 'Luminarias',
        tipoMoneda: 'CLP',
        presupuestoMensual: null,
        acumulado: 129860,
        desviacion: null
      },
      {
        concepto: 'Total Repuestos (B)',
        tipoMoneda: '',
        presupuestoMensual: null,
        acumulado: 5513251,
        desviacion: null,
        isSummary: true
      },
      {
        concepto: 'Total Mes (A+B)',
        tipoMoneda: '',
        presupuestoMensual: null,
        acumulado: 5661565,
        desviacion: null,
        isSummary: true,
        isTotal: true
      }
    ];
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.originalOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFn = (value: any): string => {
    if (!value) return '';
    if (value === 'TODOS') return 'TODOS';
    const cliente = this.user.companies.find((company: any) => company.id === value);
    return cliente ? cliente.nombre : '';
  };

  displayMesFn = (mes: any): string => {
    if (!mes) return '';
    return mes.mes || '';
  };

  clearMes() {
    this.informeForm.patchValue({
      mesActual: null
    });
  }

  onCompanySelected(event: any) {
    if (!event.option.value) {
      this.informeForm.patchValue({
        cliente: null,
        mesActual: null
      });
      this.informeForm.get('mesActual')?.disable();
      this.selectedCompanyName = '';
      this.meses = [];
      return;
    }

    const selectedCompany = this.user.companies.find((company: any) => company.nombre === event.option.value);
    if (selectedCompany) {
      this.selectedCompanyName = event.option.value;
      this.informeForm.patchValue({
        cliente: selectedCompany.id,
        mesActual: null
      });
      
      this.informeForm.get('mesActual')?.enable();
      
      this.informeGastosAcumuladosService.getMesesByCliente(selectedCompany.id).subscribe((meses) => {
        this.meses = meses;
      });
    }
  }

  setFilter() {
    if (this.informeForm.invalid) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    const { cliente, mesActual } = this.informeForm.value;
    const fechaInicio = mesActual.fecha_inicio;
    const fechaFin = mesActual.fecha_fin;

    this.informeGastosAcumuladosService.getInformeConsumo(
      fechaInicio,
      fechaFin,
      cliente
    ).subscribe(
      (data: any) => {
        // Aquí podrías actualizar this.tableData con los datos reales
        console.log('Datos recibidos:', data);
      },
      (error: any) => {
        console.error('Error al obtener el informe:', error);
      }
    );
  }

  clearClient() {
    this.informeForm.patchValue({
      cliente: null,
      mesActual: null
    });
    this.informeForm.get('mesActual')?.disable();
    this.selectedCompanyName = '';
    this.informeForm.get('cliente')?.setValue('');
    this.filteredOptions = of(this.originalOptions);
    this.meses = [];
  }

  private initializeMeses() {
    this.meses = [
      { id: 1, mes: 'Enero 2025' },
      { id: 2, mes: 'Febrero 2025' },
      { id: 3, mes: 'Marzo 2025' },
      { id: 4, mes: 'Abril 2025' },
      { id: 5, mes: 'Mayo 2025' }
    ];
  }
}
