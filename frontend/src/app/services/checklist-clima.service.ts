import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

/**
 * Servicio para gestionar los checklists de mantenimiento de clima
 * Maneja todas las operaciones CRUD con el backend
 */
@Injectable({
  providedIn: 'root'
})
export class ChecklistClimaService {
  private apiUrl = `${environment.apiUrl}checklist-clima`;

  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo checklist de clima
   * @param checklistData Datos del checklist a crear (solicitudId, activoFijoId, fecha, etc.)
   * @returns Observable con el checklist creado
   * @example
   * const checklistData = {
   *   solicitudId: 1,
   *   activoFijoId: 2,
   *   fecha: '2024-03-20',
   *   horaInicio: '09:00',
   *   horaTermino: '11:00',
   *   movil: 'ABC123',
   *   verificacionServicio: {
   *     evaporador: { estado: 'realizado', comentario: 'Limpieza completa' },
   *     drenaje: { estado: 'realizado', comentario: 'Sin obstrucciones' }
   *   },
   *   medicionRendimiento: {
   *     temperaturaAmbiente: 24,
   *     humedadRelativa: 65,
   *     temperaturaEvaporador: 18
   *   },
   *   consumoElectrico: {
   *     voltaje: 220,
   *     amperaje: 15.5
   *   },
   *   observacionesGenerales: 'Equipo en buen estado general',
   *   firmaTecnico: {
   *     nombre: 'Juan Pérez',
   *     rut: '12345678-9',
   *     fecha: '2024-03-20'
   *   },
   *   firmaCliente: {
   *     nombre: 'María López',
   *     rut: '98765432-1',
   *     fecha: '2024-03-20'
   *   }
   * }
   */
  create(checklistData: any): Observable<any> {
    return this.http.post(this.apiUrl, checklistData);
  }

  /**
   * Obtiene todos los checklists de clima
   * @returns Observable con array de todos los checklists
   */
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Obtiene un checklist específico por su ID
   * @param id ID del checklist a buscar
   * @returns Observable con el checklist encontrado
   */
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene todos los checklists asociados a una solicitud
   * @param solicitudId ID de la solicitud de servicio
   * @returns Observable con array de checklists de la solicitud
   */
  getBySolicitud(solicitudId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/solicitud/${solicitudId}`);
  }

  /**
   * Actualiza un checklist existente
   * @param id ID del checklist a actualizar
   * @param checklistData Nuevos datos del checklist
   * @returns Observable con el checklist actualizado
   */
  update(id: number, checklistData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, checklistData);
  }

  /**
   * Elimina un checklist
   * @param id ID del checklist a eliminar
   * @returns Observable con la respuesta del servidor
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 