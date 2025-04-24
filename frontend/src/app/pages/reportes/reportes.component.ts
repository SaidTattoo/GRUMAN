import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  standalone: true,
  imports: [JsonPipe, CommonModule],
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {

  constructor() { }

}
