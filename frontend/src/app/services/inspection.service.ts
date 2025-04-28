import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

export interface Section {
  id: number;
  name: string;
  items: Item[];
}

export interface Item {
  id: number;
  name: string;
  subItems: SubItem[];
}

export interface SubItem {
  id: number;
  name: string;
  disabled?: boolean;
  fotos?: string[];
  repuestos?: any[];
  foto_obligatoria?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InspectionService {
  private apiUrl = `${environment.apiUrl}inspection`;

  constructor(private http: HttpClient) {}

  // Secciones
  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections`);
  }

  createSection(section: { name: string }): Observable<Section> {
    return this.http.post<Section>(`${this.apiUrl}/sections`, section);
  }

  updateSection(id: number, section: { name: string }): Observable<Section> {
    return this.http.patch<Section>(`${this.apiUrl}/sections/${id}`, section);
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${id}`);
  }

  // Items
  createItem(sectionId: number, item: { name: string }): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/sections/${sectionId}/items`, item);
  }

  updateItem(sectionId: number, itemId: number, item: { name: string }): Observable<Item> {
    return this.http.patch<Item>(`${this.apiUrl}/sections/${sectionId}/items/${itemId}`, item);
  }

  deleteItem(sectionId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${sectionId}/items/${itemId}`);
  }

  // SubItems
  createSubItem(sectionId: number, itemId: number, subItem: { name: string }): Observable<SubItem> {
    return this.http.post<SubItem>(
      `${this.apiUrl}/sections/${sectionId}/items/${itemId}/subitems`, 
      subItem
    );
  }

  updateSubItem(sectionId: number, itemId: number, subItemId: number, subItem: { name?: string; foto_obligatoria?: boolean }): Observable<SubItem> {
    return this.http.patch<SubItem>(`${this.apiUrl}/sections/${sectionId}/items/${itemId}/subitems/${subItemId}`, subItem);
  }

  cambiarEstadoFoto(sectionId: number, itemId: number, subItemId: number, subItem: { foto_obligatoria?: boolean, name: string }): Observable<SubItem> {
    return this.http.patch<SubItem>(`${this.apiUrl}/sections/${sectionId}/items/${itemId}/subitems/${subItemId}`, subItem);
  }

  deleteSubItem(sectionId: number, itemId: number, subItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${sectionId}/items/${itemId}/subitems/${subItemId}`);
  }

  disableSection(sectionId: number) {
    return this.http.delete(`${this.apiUrl}/sections/${sectionId}`);
  }

  cleanupInspectionLists() {
    return this.http.post(`${this.apiUrl}/cleanup-lists`, {});
  }
  
  insertRepuestoInItem(itemId: string, repuestoId: number, cantidad: number, comentario: string, solicitarVisitaId: any, estado?: string) {
    return this.http.post(`${this.apiUrl}/items/${itemId}/repuestos`, { 
      repuestoId, 
      cantidad, 
      comentario, 
      solicitarVisitaId,
      estado
    });
  }
  deleteRepuestoFromItem(id: string) {
    return this.http.delete(`${this.apiUrl}/items/${id}`);
  }
} 