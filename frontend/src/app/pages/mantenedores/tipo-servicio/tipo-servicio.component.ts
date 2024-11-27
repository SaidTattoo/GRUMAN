import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';

@Component({
  selector: 'app-tipo-servicio',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, ],

  templateUrl: './tipo-servicio.component.html',
  styleUrl: './tipo-servicio.component.scss'
})
export class TipoServicioComponent {
  constructor(private tipoServicioService: TipoServicioService, private router: Router) {}
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  dataSource: any[] = [];
  ngOnInit(): void {
    this.tipoServicioService.findAll().subscribe((data) => {
      console.log(data);
      this.dataSource = data;
    });
  }
  crear() {
    this.router.navigate(['/mantenedores/tipo-servicio/crear']);
  }
  editar(element: any) {
    console.log(element);
  }
  eliminar(element: any) {
    console.log(element);
  }
}
