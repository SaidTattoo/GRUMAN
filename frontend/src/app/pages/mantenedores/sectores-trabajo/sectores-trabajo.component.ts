import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { SectoresService } from 'src/app/services/sectores.service';

@Component({
  selector: 'app-sectores-trabajo',
  standalone: true,
  imports: [ CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule ,MatMenuModule,MatIconModule,MatTableModule],
  templateUrl: './sectores-trabajo.component.html',
  styleUrl: './sectores-trabajo.component.scss'
})
export class SectoresTrabajoComponent implements OnInit {
    constructor(private readonly sectoresTrabajoService: SectoresService) {}
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
    displayedColumns: string[] = ['nombre', 'acciones'];
   
    ngOnInit(): void {
        this.sectoresTrabajoService.getSectores().subscribe(sectores => {
            //console.log(sectores);
            this.dataSource = new MatTableDataSource<any>(sectores);
           
        });
    }
    editarSector(id: number) {
        //console.log(id);
    }
}
