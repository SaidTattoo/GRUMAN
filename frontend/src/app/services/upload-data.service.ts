import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class UploadDataService {

  constructor(private http: HttpClient) { }

  uploadFile(file: File, path: string) {
    const formData = new FormData();
    formData.append('file', file);
    //return this.http.post(`http://localhost:3000/upload/${path}`, formData);
    return this.http.post(`${environment.apiUrl}upload/${path}`, formData);
  }
}
