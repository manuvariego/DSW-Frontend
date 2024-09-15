import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private _http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/locations';

  getLocations(): Observable<any[]>{
    return this._http.get<any[]>(this.apiUrl);
  }

  getLocation(locationId: string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${locationId}`)
  }

  createLocation(location: any): Observable<any> {
    return this._http.post<any>(this.apiUrl, location);
  } 

  deleteLocation(locationId: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/${locationId}`);
  }

  updateLocation(location: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${location.id}`, location);
  }
  

 } 