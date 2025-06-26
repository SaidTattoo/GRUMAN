import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoSolicitudService {
  private apiUrl = `${environment.apiUrl}/sla`;

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  findAllClientes() {
    return this.http.get<any[]>(`${environment.apiUrl}/client`);
  }

  findByClienteId(clienteId: number) {
    return this.http.get<any[]>(this.apiUrl).toPromise().then((response: any[] | undefined) => {
      return (response || []).filter((item: any) => item.cliente?.id === clienteId);
    });
  }
}
