import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
interface Item {
  id: number;
  name: string;
  subItems: SubItem[];
}

interface SubItem {
  id: number;
  name: string;
}
@Component({
  selector: 'app-lista-de-inspecciones',
  standalone: true,
  imports: [  CommonModule,
    MatCardModule, 
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatStepperModule ],
  templateUrl: './lista-de-inspecciones.component.html',
  styleUrl: './lista-de-inspecciones.component.scss'
})
export class ListaDeInspeccionesComponent implements OnInit {

  items: Item[] = [
    { 
      id: 1, 
      name: 'Item 1',
      subItems: []
    },
    { 
      id: 2, 
      name: 'Item 2',
      subItems: []
    }
  ];
  constructor() {}

  ngOnInit(): void {
   
  }

  addItem() {
    const newItem: Item = {
      id: this.items.length + 1,
      name: `Item ${this.items.length + 1}`,
      subItems: []
    };
    this.items.push(newItem);
  }
  addSubItem(item: Item) {
    const newSubItem: SubItem = {
      id: item.subItems.length + 1,
      name: `Sub-item ${item.subItems.length + 1}`
    };
    item.subItems.push(newSubItem);
  }
  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  removeSubItem(item: Item, subItemIndex: number) {
    item.subItems.splice(subItemIndex, 1);
  }
}
