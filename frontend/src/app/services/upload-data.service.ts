import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../config';


@Injectable({
  providedIn: 'root'
})
export class UploadDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Subir un archivo al servidor.
   * @param formData - FormData que contiene el archivo.
   * @param path - Ruta en el backend donde se subirá el archivo.
   * @returns Observable con la respuesta del servidor.
   */
  uploadFile(formData: FormData, path: string): Observable<any> {
    // Solo limpiar barras extras del path
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    
    // Construir la URL asegurándose de que no haya dobles barras
    const url = `${this.apiUrl}upload/${cleanPath}`;
    
    console.log('URL de carga:', url); // Para debugging
    
    // Asegurarse de que el FormData tenga el archivo con el nombre 'file'
    const file = formData.get('file');
    if (!file) {
      console.warn('No se encontró el archivo en FormData');
      throw new Error('No se encontró el archivo');
    }

    // Realizar la petición POST
    return this.http.post(url, formData)
      .pipe(
        map((response: any) => {
          if (response && response.url) {
            // Limpiar la URL antes de devolverla
            response.url = response.url
              .replace(/([^:]\/)\/+/g, '$1')
              .replace(/localhost:3000/, environment.apiUrl);
          }
          return response;
        })
      );
  }

  /**
   * Descargar un archivo desde el servidor.
   * @param path - Ruta en el backend desde donde se descargará el archivo.
   * @returns Observable con el archivo como blob.
   */
  downloadFile(path: string): Observable<any> {
    console.log('Descargando archivo...');
    console.log('Ruta del servidor:', `${this.apiUrl}upload/${path}`);

    return this.http.get(`${this.apiUrl}upload/${path}`, {
      responseType: 'blob'
    });
  }

  /**
   * Eliminar un archivo del servidor.
   * @param path - Ruta en el backend del archivo a eliminar.
   * @returns Observable con la respuesta del servidor.
   */
  deleteFile(path: string): Observable<any> {
    console.log('Eliminando archivo...');
    console.log('Ruta del servidor:', `${this.apiUrl}upload/${path}`);

    const url = `${this.apiUrl}upload/${path}`;
    return this.http.delete(url);
  }

  /**
   * Subir un archivo específicamente para una solicitud.
   * @param formData - FormData que contiene el archivo.
   * @param solicitudId - ID de la solicitud
   * @param itemId - ID del item
   * @returns Observable con la respuesta del servidor.
   */
  uploadSolicitudFile(formData: FormData, solicitudId: number, itemId: number): Observable<any> {
    console.log('Subiendo archivo de solicitud...');
    
    const file = formData.get('file');
    if (!file) {
      console.warn('No se encontró el archivo en FormData');
      throw new Error('No se encontró el archivo');
    }

    const url = `${this.apiUrl}upload/solicitudes/${solicitudId}/${itemId}`;
    return this.http.post(url, formData);
  }
}
