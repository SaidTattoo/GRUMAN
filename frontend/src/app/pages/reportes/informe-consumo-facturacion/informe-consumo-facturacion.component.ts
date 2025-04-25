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
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { InformeConsumoService } from './informe-consumo-facturacion.service';
import { MatTooltipModule } from '@angular/material/tooltip';
export interface ConsumoData {
  requerimiento: string;
  tipo_servicio: string;
  local: string;
  repuesto: string;
  cliente: string;
  cliente_id: string;
  cantidad: number;
  precio_compra: number;
  precio_venta_cliente: number;
  valor_cliente: number;
  fechaVisita: Date;
  nombre_tecnico: string;
}

@Component({
  selector: 'app-informe-consumo-facturacion',
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
    MatPaginatorModule,
    CurrencyPipe,
    MatTooltipModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideNativeDateAdapter()
  ],
  templateUrl: './informe-consumo-facturacion.component.html',
  styleUrl: './informe-consumo-facturacion.component.scss'
})
export class InformeConsumoFacturacionComponent implements OnInit {
  informeForm: FormGroup;
  filteredOptions: Observable<any[]>;
  dataSource = new MatTableDataSource<ConsumoData>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private user: any;
  private storageSubscription: Subscription;
  firstoption: any[] = [];
  originalOptions: any[] = [];
  selectedCompanyName: string = '';
  mesFacturacionList: any[] = [];
  displayedColumns: string[] = [
    'requerimiento',
    'tipo_servicio',
    'local',
    'repuesto',
    'cliente',
    'cantidad',
    'precio_compra',
    'precio_venta_cliente',
    'valor_cliente',
    'fechaVisita',
    'nombre_tecnico'
  ];

  constructor(
    private fb: FormBuilder,
    private storage: StorageService,
    private informeConsumoService: InformeConsumoService
  ) {
    this.informeForm = this.fb.group({
      cliente: ['', Validators.required],
      mesFacturacion: [{ value: null, disabled: true }, Validators.required],
    });

    this.filteredOptions = this.informeForm.get('cliente')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value) {
          return this.originalOptions;
        }
        return this._filter(value);
      })
    );
  }

  ngOnInit() {
    this.storageSubscription = this.storage.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.firstoption = this.user.companies.filter((company: any) => company.nombre.toLowerCase() !== 'gruman');
        this.originalOptions = [...this.firstoption];
      }
    });

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.originalOptions.filter(option => 
      option.nombre.toLowerCase() !== 'gruman' && 
      option.nombre.toLowerCase().includes(filterValue)
    );
  }


  displayFn = (clientId: number): string => {
    const cliente = this.originalOptions.find(c => c.id === clientId);
    return cliente ? cliente.nombre : '';
  }

  displayMesFn = (mesId: number): string => {
    const mes = this.mesFacturacionList.find(m => m.id === mesId);
    return mes ? mes.mes : '';
  }

  onCompanySelected(event: any) {
    if (!event.option.value) {
      this.informeForm.patchValue({
        cliente: null
      });
      this.selectedCompanyName = '';

      this.informeForm.get('mesFacturacion')?.disable();
      return;
    }

    // const selectedCompany = this.user.companies.find((company: any) => company.nombre === event.option.value);

    this.informeConsumoService.getMesFacturacion(event.option.value).subscribe((listMesFacturacion: any) => {
      this.mesFacturacionList = listMesFacturacion
      this.informeForm.get('mesFacturacion')?.enable();
    });
    this.selectedCompanyName = event.option.value;
    // this.informeForm.patchValue({
    //   cliente: selectedCompany ? selectedCompany.id : null
    // });
  }

  onMesFacturacionSelected(event: any) {
    debugger;
    this.informeForm.patchValue({
      mesFacturacion: event.option.value
    });
  }

  setFilter() {
    if (this.informeForm.invalid) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    const { cliente, fechaInicio, fechaFin } = this.informeForm.value;
    const fechaInicioStr = this.formatDate(fechaInicio);
    const fechaFinStr = this.formatDate(fechaFin);

    this.informeConsumoService.getInformeConsumo(
      fechaInicioStr,
      fechaFinStr,
      cliente
    ).subscribe(
      (data: any) => {
        this.dataSource.data = data[0];
      },
      (error: any) => {
        console.error('Error al obtener el informe:', error);
      }
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  clearClient() {
    this.informeForm.patchValue({
      cliente: null
    });
    this.selectedCompanyName = '';
    this.informeForm.get('cliente')?.setValue('');
    this.informeForm.get('mesFacturacion')?.disable();
  }
  clearMes() {
    this.informeForm.patchValue({
      mesFacturacion: null
    });
    this.selectedCompanyName = '';
    this.informeForm.get('mesFacturacion')?.setValue('');
  }
}
