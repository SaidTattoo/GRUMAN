import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<any> {
    const params = {
      q: address,
      format: 'json',
      addressdetails: '1',
      limit: '1',      
      countrycodes: 'CL', // Restringir a Chile

    };

    return this.http.get(this.nominatimUrl, { params });
  }

  searchAddress(query: string): Observable<any> {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',     
      countrycodes: 'CL', // Restringir a Chile

    };
    return this.http.get(this.nominatimUrl, { params });
  }
}
