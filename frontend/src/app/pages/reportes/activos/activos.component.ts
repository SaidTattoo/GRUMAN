import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activos.component.html',
  styles: [`
    .container {
      padding: 20px;
    }
    .content {
      margin-top: 20px;
    }
  `]
})
export class ActivosComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
