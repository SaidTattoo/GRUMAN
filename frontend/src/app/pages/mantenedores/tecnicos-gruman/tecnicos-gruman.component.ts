import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-tecnicos-gruman',
  standalone: true,
  imports: [ 
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatTableModule,
    RouterModule,
    MatIconModule
    
  ],
  templateUrl: './tecnicos-gruman.component.html',
  styleUrl: './tecnicos-gruman.component.scss'
})
export class TecnicosGrumanComponent implements OnInit {

  constructor(private usersService: UsersService, private router: Router){}
  tecnicos: any[] = [];
  dataSource: any[] = [];
  displayedColumns: string[] = [ 'name', 'especialidades', 'acciones'];
  ngOnInit(): void {
    this.usersService.getAllTecnicos().subscribe((tecnicos: any) => {
      this.tecnicos = tecnicos;
      this.dataSource = this.tecnicos;
    });
  }
  getEspecialidadesNombres(especialidades: any[]): string {
    if (!especialidades || especialidades.length === 0) {
      return 'Sin especialidad';
    }
    return especialidades.map(e => e.nombre).join(', ');
  }
  createTecnicoGruman() {
    this.router.navigate(['/mantenedores/tecnicos-gruman/crear-tecnico-gruman']);
  }
  editTecnicoGruman(tecnico: any) {
    this.router.navigate(['/mantenedores/tecnicos-gruman/editar-tecnico-gruman', tecnico.id]);
  }
}
