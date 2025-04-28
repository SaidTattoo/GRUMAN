import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';
import { EditItemDialogComponent } from './edit-item-dialog/edit-item-dialog.component';
import { InspectionService, Section, Item, SubItem } from '../../../services/inspection.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-lista-de-inspecciones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  templateUrl: './lista-de-inspecciones.component.html',
  styleUrl: './lista-de-inspecciones.component.scss'
})
export class ListaDeInspeccionesComponent implements OnInit {
  sections: Section[] = [];
  selectedSectionIndex: number | null = null;
  selectedItemIndex: number | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  expandedItems: Set<number> = new Set();

  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('itemStepper') itemStepper!: MatStepper;

  constructor(
    private dialog: MatDialog,
    private inspectionService: InspectionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSections();
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
        this.error = 'Error al cargar las secciones. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }
  volver() {
    this.router.navigate(['/mantenedores/clientes']);
  }
  addSection() {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '400px',
      data: { name: '', title: 'Nueva Sección' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inspectionService.createSection({ name: result }).subscribe({
          next: () => {
            this.loadSections();
            setTimeout(() => {
              if (this.sections.length) {
                const lastIndex = this.sections.length - 1;
                this.selectedSectionIndex = lastIndex;
                if (this.stepper) {
                  this.stepper.selectedIndex = lastIndex;
                }
              }
            }, 100);
          },
          error: (error) => console.error('Error creating section:', error)
        });
      }
    });
  }

  addItem(section: Section) {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '400px',
      data: { name: '', title: 'Nuevo Item' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inspectionService.createItem(section.id, { name: result }).subscribe({
          next: (newItem) => {
            // Recargar las secciones para asegurar datos frescos
            this.loadSections();

            setTimeout(() => {
              const sectionIndex = this.sections.findIndex(s => s.id === section.id);
              if (sectionIndex !== -1) {
                this.selectedSectionIndex = sectionIndex;
                if (this.stepper) {
                  this.stepper.selectedIndex = sectionIndex;
                  // Expandir el nuevo item
                  if (this.sections[sectionIndex].items?.length > 0) {
                    const lastItemId = this.sections[sectionIndex].items[
                      this.sections[sectionIndex].items.length - 1
                    ].id;
                    this.expandedItems.add(lastItemId);
                  }
                }
              }
            }, 100);
          },
          error: (error) => {
            console.error('Error creating item:', error);
          }
        });
      }
    });
  }

  addSubItem(section: Section, item: Item) {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '400px',
      data: { name: '', title: 'Nueva Actividad' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inspectionService.createSubItem(section.id, item.id, { name: result }).subscribe({
          next: (newSubItem) => {
            if (!item.subItems) {
              item.subItems = [];
            }
            item.subItems = [...item.subItems, newSubItem];
            this.sections = [...this.sections];
          },
          error: (error) => {
            console.error('Error creating subitem:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
          }
        });
      }
    });
  }

  removeSection(index: number) {
    const section = this.sections[index];
    
    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Estás a punto de eliminar la sección <strong>${section.name}</strong></p>
        <p class="text-danger">Esta acción también eliminará:</p>
        <ul class="text-left">
          <li>Todos los items asociados</li>
          <li>Todas las actividades de cada item</li>
        </ul>
        <p class="text-danger"><strong>Esta acción no se puede deshacer</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.inspectionService.deleteSection(section.id).subscribe({
          next: () => {
            this.sections = this.sections.filter((_, i) => i !== index);
            Swal.fire(
              'Eliminado',
              'La sección y sus elementos han sido eliminados',
              'success'
            );
          },
          error: (error) => {
            console.error('Error deleting section:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar la sección',
              'error'
            );
          }
        });
      }
    });
  }

  removeItem(section: Section, itemIndex: number) {
    const item = section.items[itemIndex];
    
    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Estás a punto de eliminar el item:</p>
        <p><strong>${item.name}</strong></p>
        <p class="text-danger">Esta acción también eliminará:</p>
        <ul class="text-left">
          <li>Todas las actividades asociadas a este item</li>
        </ul>
        <p class="text-danger"><strong>Esta acción no se puede deshacer</strong></p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.inspectionService.deleteItem(section.id, item.id).subscribe({
          next: () => {
            section.items = section.items.filter((_, i) => i !== itemIndex);
            this.sections = [...this.sections];
            Swal.fire(
              'Eliminado',
              'El item y sus actividades han sido eliminados',
              'success'
            );
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar el item',
              'error'
            );
          }
        });
      }
    });
  }

  removeSubItem(section: Section, item: Item, subItemIndex: number) {
    const subItem = item.subItems[subItemIndex];
    
    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Estás a punto de eliminar la actividad:</p>
        <p><strong>${subItem.name}</strong></p>
        <p class="text-danger">Esta acción no se puede deshacer</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.inspectionService.deleteSubItem(section.id, item.id, subItem.id).subscribe({
          next: () => {
            item.subItems = item.subItems.filter((_, i) => i !== subItemIndex);
            this.sections = [...this.sections];
            Swal.fire(
              'Eliminado',
              'La actividad ha sido eliminada',
              'success'
            );
          },
          error: (error) => {
            console.error('Error deleting subitem:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar la actividad',
              'error'
            );
          }
        });
      }
    });
  }

  editSection(section: Section) {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '400px',
      data: { name: section.name, title: 'Editar Sección' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inspectionService.updateSection(section.id, { name: result }).subscribe({
          next: (updatedSection) => {
            const index = this.sections.findIndex(s => s.id === section.id);
            if (index !== -1) {
              this.sections[index] = { ...this.sections[index], ...updatedSection };
              this.sections = [...this.sections];
            }
          },
          error: (error) => {
            console.error('Error updating section:', error);
          }
        });
      }
    });
  }

  editItem(section: Section, item: Item) {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '400px',
      data: { name: item.name, title: 'Editar Item' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inspectionService.updateItem(section.id, item.id, { name: result }).subscribe({
          next: (updatedItem) => {
            const sectionIndex = this.sections.findIndex(s => s.id === section.id);
            if (sectionIndex !== -1) {
              const itemIndex = this.sections[sectionIndex].items.findIndex(i => i.id === item.id);
              if (itemIndex !== -1) {
                this.sections[sectionIndex].items[itemIndex] = {
                  ...this.sections[sectionIndex].items[itemIndex],
                  ...updatedItem
                };
                this.sections = [...this.sections];
              }
            }
          },
          error: (error) => {
            console.error('Error updating item:', error);
          }
        });
      }
    });
  }

  editSubItem(section: Section, item: Item, subItem: SubItem) {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '400px',
      data: { name: subItem.name, title: 'Editar Actividad' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inspectionService.updateSubItem(section.id, item.id, subItem.id, { name: result }).subscribe({
          next: (updatedSubItem) => {
            const sectionIndex = this.sections.findIndex(s => s.id === section.id);
            if (sectionIndex !== -1) {
              const itemIndex = this.sections[sectionIndex].items.findIndex(i => i.id === item.id);
              if (itemIndex !== -1) {
                const subItemIndex = this.sections[sectionIndex].items[itemIndex].subItems.findIndex(
                  si => si.id === subItem.id
                );
                if (subItemIndex !== -1) {
                  this.sections[sectionIndex].items[itemIndex].subItems[subItemIndex] = {
                    ...this.sections[sectionIndex].items[itemIndex].subItems[subItemIndex],
                    ...updatedSubItem
                  };
                  this.sections = [...this.sections];
                }
              }
            }
          },
          error: (error) => {
            console.error('Error updating subitem:', error);
          }
        });
      }
    });
  }

  onSectionSelectionChange(event: any) {
    if (!this.sections.length) return;

    const newIndex = event.selectedIndex;
    if (this.selectedSectionIndex === newIndex) {
      this.selectedSectionIndex = null;
      if (this.stepper) {
        this.stepper.selectedIndex = 0;
      }
    } else {
      this.selectedSectionIndex = newIndex;
    }
  }

  onItemSelectionChange(event: any) {
    if (!event || !this.sections.length) return;

    const newIndex = event.selectedIndex;
    if (this.selectedItemIndex === newIndex) {
      this.selectedItemIndex = null;
      if (this.itemStepper) {
        this.itemStepper.selectedIndex = 0;
      }
    } else {
      this.selectedItemIndex = newIndex;
    }
  }

  onPanelExpanded(itemId: number) {
    this.expandedItems.add(itemId);
  }

  onPanelClosed(itemId: number) {
    this.expandedItems.delete(itemId);
  }

  isPanelExpanded(itemId: number): boolean {
    return this.expandedItems.has(itemId);
  }

  async toggleFotoObligatoria(subItem: SubItem, event: MatSlideToggleChange): Promise<void> {
    try {
      const section = this.sections.find(s => s.items.some(i => i.subItems.includes(subItem)));
      const item = section?.items.find(i => i.subItems.includes(subItem));
      if (!section || !item) throw new Error('No se encontró la sección o el item');
      
      this.inspectionService.cambiarEstadoFoto(section.id, item.id, subItem.id, { 
        foto_obligatoria: event.checked,
        name: subItem.name
      })
        .subscribe({
          next: () => {
            subItem.foto_obligatoria = event.checked;
          },
          error: (error) => {
            console.error('Error al actualizar foto obligatoria:', error);
            event.source.checked = !event.checked;
            this.snackBar.open('Error al actualizar el estado de la foto', 'Cerrar', { duration: 3000 });
          }
        });
    } catch (error) {
      console.error('Error al actualizar foto obligatoria:', error);
      event.source.checked = !event.checked;
      this.snackBar.open('Error al actualizar el estado de la foto', 'Cerrar', { duration: 3000 });
    }
  }
}
