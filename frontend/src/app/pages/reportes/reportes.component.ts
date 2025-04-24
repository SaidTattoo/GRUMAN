import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReportesService } from './reportes.service';
@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  standalone: true,
  imports: [JsonPipe, CommonModule, HttpClient, ReportesService],
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {

  constructor() { }

}
