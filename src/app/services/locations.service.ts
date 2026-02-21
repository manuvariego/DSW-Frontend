import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Location } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/locations`;

  getLocations(): Observable<Location[]> {
    return this._http.get<Location[]>(this.apiUrl);
  }

  getLocation(locationId: string): Observable<Location> {
    return this._http.get<Location>(`${this.apiUrl}/${locationId}`);
  }

  createLocation(location: Partial<Location>): Observable<Location> {
    return this._http.post<Location>(this.apiUrl, location);
  }

  deleteLocation(locationId: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${locationId}`);
  }

  updateLocation(location: Location): Observable<Location> {
    return this._http.put<Location>(`${this.apiUrl}/${location.id}`, location);
  }
}
