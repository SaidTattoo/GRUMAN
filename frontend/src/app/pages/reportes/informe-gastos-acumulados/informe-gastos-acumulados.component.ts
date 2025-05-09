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
import { environment } from 'src/environments/environment';

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
  valorUF: number = 0;

  dataList: any = null

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
    });

    this.filteredOptions = this.informeForm.get('cliente')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    this.informeGastosAcumuladosService.getValorUF().subscribe((data) => {
      this.valorUF = data.value;
    });

    this.mesActual = new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).toUpperCase();

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
  }

  private initializeTableData() {
    this.tableData = [];
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



  onCompanySelected(event: any) {
    if (!event.option.value) {
      this.informeForm.patchValue({
        cliente: null,
      });
      this.selectedCompanyName = '';
      this.meses = [];
      return;
    }

    const selectedCompany = this.user.companies.find((company: any) => company.nombre === event.option.value);
    if (selectedCompany) {
      this.selectedCompanyName = event.option.value;
      this.informeForm.patchValue({
        cliente: selectedCompany.id,
      });
      
      this.informeGastosAcumuladosService
        .getInformeGastoAcumulado(selectedCompany.id)
        .subscribe((data:any) => {
          console.log(data);
          this.tableData = [
            {
              concepto: 'Valor Servicios',
              tipoMoneda: data.headerFile.currency,
              presupuestoMensual: data.headerFile.monthly_cost,
              acumulado: data.headerFile.accumulated_cost,
              desviacion: data.headerFile.percentage_cost_diff,
            },
            {
              concepto: 'Total Servicios (A)',
              tipoMoneda: 'CLP',
              presupuestoMensual: 0,
              acumulado: Math.round(
                data.headerFile.accumulated_cost * this.valorUF
              ),
              desviacion: 0,
              isSummary: true,
            },
            // {
            //   concepto: 'Correctivo',
            //   tipoMoneda: 'CLP',
            //   presupuestoMensual: 11000000,
            //   acumulado: data.headerFile.accumulated_cost * this.valorUF,
            //   desviacion: -60.72,
            // },
            // {
            //   concepto: 'Inversion',
            //   tipoMoneda: 'CLP',
            //   presupuestoMensual: 11000000,
            //   acumulado: 206919,
            //   desviacion: -98.12,
            // },
            // {
            //   concepto: 'Reactivos RM',
            //   tipoMoneda: 'CLP',
            //   presupuestoMensual: 3000000,
            //   acumulado: 855206,
            //   desviacion: -71.49,
            // },
            // {
            //   concepto: 'Reactivos Regiones',
            //   tipoMoneda: '',
            //   presupuestoMensual: null,
            //   acumulado: 0,
            //   desviacion: null,
            // },
            // {
            //   concepto: 'Luminarias',
            //   tipoMoneda: 'CLP',
            //   presupuestoMensual: data.luminariesFile,
            //   acumulado: 129860,
            //   desviacion: null,
            // },
            // {
            //   concepto: 'Total Repuestos (B)',
            //   tipoMoneda: '',
            //   presupuestoMensual: null,
            //   acumulado: 5513251,
            //   desviacion: null,
            //   isSummary: true,
            // },
            // {
            //   concepto: 'Total Mes (A+B)',
            //   tipoMoneda: '',
            //   presupuestoMensual: null,
            //   acumulado: 5661565,
            //   desviacion: null,
            //   isSummary: true,
            //   isTotal: true,
            // },
          ];
          let totalRepuestos = 0;

          data.servicesFile.forEach((item: any) => {
            const monthlyCost = item.monthly_cost ?? 0;
            totalRepuestos += parseFloat(monthlyCost.toString());
            this.tableData.push({
              concepto: item.name,
              tipoMoneda: item.currency,
              presupuestoMensual: 26000000,
              acumulado: monthlyCost,
              desviacion: monthlyCost * 100 / 26000000,
            });
          });

          const reactivoRMCost = Math.round(data.reactiveRMFile.accumulated_cost);
          totalRepuestos += parseFloat(reactivoRMCost.toString());
          this.tableData.push({
            concepto: 'Reactivo RM', 
            tipoMoneda: 'CLP',
            presupuestoMensual: 3000000,
            acumulado: reactivoRMCost,
            desviacion: reactivoRMCost * 100 / 3000000,
          });

          const reactivoRegionesCost = Math.round(data.reactiveRegionsFile.accumulated_cost) ?? 0;
          totalRepuestos += parseFloat(reactivoRegionesCost.toString());
          this.tableData.push({
            concepto: 'Reactivo Regiones',
            tipoMoneda: 'CLP', 
            presupuestoMensual: 3000000,
            acumulado: reactivoRegionesCost,
            desviacion: (reactivoRegionesCost * 100) / 3000000,
          });

          data.luminariesFile.forEach((item: any) => {
            const monthlyCost = item.monthly_cost ?? 0;
            totalRepuestos += parseFloat(monthlyCost.toString());
            this.tableData.push({
              concepto: 'Luminarias',
              tipoMoneda: item.currency,
              presupuestoMensual: 0, 
              acumulado: monthlyCost,
              desviacion: 0,
            });
          });

          this.tableData.push({
            concepto: 'Total Repuestos (B)',
            tipoMoneda: 'CLP',
            presupuestoMensual: 0,
            acumulado: Math.round(totalRepuestos), 
            desviacion: null,
            isSummary: true,
          });

          const totalServicios = this.tableData
            .filter(row => row.isSummary && row.concepto !== 'Total Repuestos (B)')
            .reduce((sum, row) => sum + (row.acumulado || 0), 0);

          this.tableData.push({
            concepto: 'Total Mes (A+B)', 
            tipoMoneda: 'CLP',
            presupuestoMensual: 0,
            acumulado: Math.round(totalRepuestos + totalServicios),
            desviacion: null,
            isTotal: true,
          });

        });
    }
  }

  setFilter() {
    if (this.informeForm.invalid) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    const { cliente } = this.informeForm.value;

    this.informeGastosAcumuladosService.getInformeGastoAcumulado(cliente).subscribe((data) => {
      console.log(data);
      this.dataList = data;
    });
  }

  clearClient() {
    this.informeForm.patchValue({
      cliente: null,
    });
    this.selectedCompanyName = '';
    this.informeForm.get('cliente')?.setValue('');
    this.filteredOptions = of(this.originalOptions);
  }
}
