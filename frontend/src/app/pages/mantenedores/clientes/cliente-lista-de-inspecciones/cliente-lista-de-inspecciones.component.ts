import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, JsonPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { InspectionService } from 'src/app/services/inspection.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';
import Swal from 'sweetalert2';

interface Cliente {
  nombre: string;
  // ... otros campos
}

@Component({
  selector: 'app-cliente-lista-de-inspecciones',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule,MatCheckboxModule],
  templateUrl: './cliente-lista-de-inspecciones.component.html',
  styleUrls: ['./cliente-lista-de-inspecciones.component.scss']
})
export class ClienteListaDeInspeccionesComponent implements OnInit {
  sections: any[] = [];
  listaInspeccion: any[] = [];
  clienteId: any = '';
  isLoading = false;
  error: string | null = null;
  cliente:any = [];
  checkboxColor: ThemePalette = 'primary';
  constructor(
    private route: ActivatedRoute,
    private clientesService: ClientesService,
    private inspectionService: InspectionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.clienteId = this.route.snapshot.params['id'];   
    this.loadSections();
    this.cargarListaInspeccion();
    this.cargarSeccionesGuardadas();
  }

  loadSections() {
    this.isLoading = true;
    this.error = null;
    
    this.inspectionService.getSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        this.error = 'Error al cargar las secciones';
        this.isLoading = false;
      }
    });
  }

  cargarListaInspeccion() {
    this.clientesService.getCliente(this.clienteId).subscribe((cliente: any) => {
      this.cliente = cliente;
      if (cliente.listaInspeccion) {
        
        this.listaInspeccion = cliente.listaInspeccion;
      }
    });
  }
  volver() {
    this.router.navigate(['/mantenedores/clientes/editar', this.clienteId]);
  }

  isSeccionSelected(seccion: any): boolean {
    return this.listaInspeccion.some(
      (inspeccion) => inspeccion.id === seccion.id
    );
  }

  onSeccionChange(event: any, seccion: any) {
    console.log('Sección seleccionada:', {
      checked: event.checked,
      seccion: seccion,
      nombre: seccion.name,
      items: seccion.items
    });

    if (event.checked) {
      if (!this.isSeccionSelected(seccion)) {
        this.listaInspeccion.push(seccion);
      }
    } else {
      this.listaInspeccion = this.listaInspeccion.filter(
        (inspeccion) => inspeccion.id !== seccion.id
      );
    }

    localStorage.setItem(
      `secciones_cliente_${this.clienteId}`, 
      JSON.stringify(this.listaInspeccion)
    );

   // this.guardarCambios();
  }

  guardarCambios() {
    const clienteData = {
      listaInspeccion: this.listaInspeccion
    };

    this.clientesService.updateCliente(this.clienteId, clienteData).subscribe({
      next: () => {
        console.log('Lista de inspección actualizada');
      },
      error: (error) => {
        console.error('Error al actualizar la lista de inspección:', error);
      }
    });
  }

  private cargarSeccionesGuardadas() {
    const seccionesGuardadas = localStorage.getItem(`secciones_cliente_${this.clienteId}`);
    if (seccionesGuardadas) {
      this.listaInspeccion = JSON.parse(seccionesGuardadas);
    }
  }

  isItemSelected(item: any): boolean {
    return this.listaInspeccion.some(
      (inspeccion) => inspeccion.items?.some((i: any) => i.id === item.id)
    );
  }

  isSubitemSelected(subitem: any): boolean {
    return this.listaInspeccion.some(
      (inspeccion) => inspeccion.items?.some((item: any) => 
        item.subItems?.some((sub: any) => sub.id === subitem.id)
      )
    );
  }

  onItemChange(event: any, seccion: any, item: any) {
    console.log('Item seleccionado:', {
      checked: event.checked,
      seccion: seccion.name,
      item: item.name
    });

    if (event.checked) {
      // Si la sección no está seleccionada, la añadimos
      if (!this.isSeccionSelected(seccion)) {
        this.listaInspeccion.push({
          ...seccion,
          items: [item]
        });
      } else {
        // Si la sección ya existe, añadimos el item
        const seccionExistente = this.listaInspeccion.find(s => s.id === seccion.id);
        if (seccionExistente && !seccionExistente.items.some((i: any) => i.id === item.id)) {
          seccionExistente.items.push(item);
        }
      }
    } else {
      // Removemos el item de la sección
      this.listaInspeccion = this.listaInspeccion.map(s => ({
        ...s,
        items: s.items.filter((i: any) => i.id !== item.id)
      }));
    }

   this.guardarEnLocalStorage();
   //  this.guardarCambios();
  }

  onSubitemChange(event: any, seccion: any, item: any, subitem: any) {
    console.log('Subitem seleccionado:', {
      checked: event.checked,
      seccion: seccion.name,
      item: item.name,
      subitem: subitem.name
    });

    if (event.checked) {
      // Lógica similar a onItemChange pero para subitems
      if (!this.isSeccionSelected(seccion)) {
        this.listaInspeccion.push({
          ...seccion,
          items: [{
            ...item,
            subItems: [subitem]
          }]
        });
      } else {
        const seccionExistente = this.listaInspeccion.find(s => s.id === seccion.id);
        if (seccionExistente) {
          let itemExistente = seccionExistente.items.find((i: any) => i.id === item.id);
          if (!itemExistente) {
            itemExistente = { ...item, subItems: [] };
            seccionExistente.items.push(itemExistente);
          }
          if (!itemExistente.subItems.some((s: any) => s.id === subitem.id)) {
            itemExistente.subItems.push(subitem);
          }
        }
      }
      subitem.comentarios = '';
      subitem.repuestos = [];
    } else {
      // Removemos el subitem
      this.listaInspeccion = this.listaInspeccion.map(s => ({
        ...s,
        items: s.items.map((i: any) => ({
          ...i,
          subItems: i.subItems.filter((sub: any) => sub.id !== subitem.id)
        }))
      }));
    }

    this.guardarEnLocalStorage();
 //  this.guardarCambios();
  }

  private guardarEnLocalStorage() {
    localStorage.setItem(
      `secciones_cliente_${this.clienteId}`, 
      JSON.stringify(this.listaInspeccion)
    );
  }

  isSubitemInLocalStorage(subitem: any): boolean {
    const storedData = localStorage.getItem(`secciones_cliente_${this.clienteId}`);
    if (!storedData) return false;
    
    const storedSections = JSON.parse(storedData);
    return storedSections.some((seccion: any) => 
      seccion.items?.some((item: any) => 
        item.subItems?.some((sub: any) => sub.id === subitem.id)
      )
    );
  }

  getSubitemFromStorage(subitem: any): any {
    const storedData = localStorage.getItem(`secciones_cliente_${this.clienteId}`);
    if (!storedData) return subitem;
    
    const storedSections = JSON.parse(storedData);
    for (const seccion of storedSections) {
      for (const item of seccion.items || []) {
        const storedSubitem = (item.subItems || []).find((sub: any) => sub.id === subitem.id);
        if (storedSubitem) {
          if (!storedSubitem.comentarios) storedSubitem.comentarios = '';
          if (!storedSubitem.repuestos) storedSubitem.repuestos = [];
          return storedSubitem;
        }
      }
    }
    return subitem;
  }

  guardarListaInspeccion() {
    this.isLoading = true;
    this.error = null;

    const clienteData = {
      listaInspeccion: this.listaInspeccion
    };

    this.clientesService.updateListaInspeccion(this.clienteId, this.listaInspeccion)
      .subscribe({
        next: (response) => {
          console.log('Lista de inspección guardada:', response);
          this.guardarEnLocalStorage();
          this.isLoading = false;
          // Opcional: Mostrar mensaje de éxito
          Swal.fire('Éxito', 'Lista de inspección guardada correctamente', 'success');
          this.volver();
        },
        error: (error) => {
          console.error('Error al guardar la lista:', error);
          this.error = 'Error al guardar la lista de inspección';
          this.isLoading = false;
          Swal.fire('Error', 'No se pudo guardar la lista de inspección', 'error');
        }
      });
  }
}