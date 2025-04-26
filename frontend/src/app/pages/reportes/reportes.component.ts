import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReportesService } from './reportes.service';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  standalone: true,
  imports: [JsonPipe, CommonModule, HttpClient, ReportesService],
  styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent {
  constructor() {}
}
