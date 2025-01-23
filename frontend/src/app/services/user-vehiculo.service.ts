import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config';
import { Observable } from 'rxjs';

interface UserVehiculo {
  userId: number;
  vehiculoId: number;
  fecha_utilizado: Date;
  odometro_inicio: number;
  odometro_fin?: number;  // opcional al crear
}

@Injectable({
  providedIn: 'root'
})
export class UserVehiculoService {

  constructor(private http: HttpClient) { }
  private apiUrl = `${environment.apiUrl}user-vehiculo`;
  getUserVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserVehiculo(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createUserVehiculo(userVehiculo: UserVehiculo) {
    return this.http.post(this.apiUrl, userVehiculo);
  }

  updateUserVehiculo(id: number, userVehiculo: UserVehiculo) {
    return this.http.put(`${this.apiUrl}/${id}`, userVehiculo);
  }

  deleteUserVehiculo(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateOdometroFin(id: number, odometroFin: number) {
    return this.http.put(`${this.apiUrl}/${id}/odometro-fin`, { odometroFin });
  }

  getLastAssignment(vehiculoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/last-assignment/${vehiculoId}`);
  }

  getHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }
}
