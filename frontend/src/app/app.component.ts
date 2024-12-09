import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from './material.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,MaterialModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'ATLANTIS | Grupo de Mantenimiento y Servicios';

 
}
