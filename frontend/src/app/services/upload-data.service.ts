import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  uploadFile(formData: FormData, path: string): Observable<any> {
    // Construir la URL correctamente
    const url = `${this.apiUrl}upload/${path}`;
    console.log('URL de subida:', url); // Para debug
    return this.http.post(url, formData);
  }

  downloadFile(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}upload/${path}`, {
      responseType: 'blob'
    });
  }
  deleteFile(path: string): Observable<any> {
    const url = `${this.apiUrl}upload/${path}`;
    return this.http.delete(url);
  }
}
