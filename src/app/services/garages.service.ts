import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Garage } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GaragesService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/garages`;

  getGarages(): Observable<Garage[]> {
    return this._http.get<Garage[]>(this.apiUrl);
  }

  getGarage(garageCuit: string): Observable<Garage> {
    return this._http.get<Garage>(`${this.apiUrl}/${garageCuit}`);
  }

  createGarage(garage: any): Observable<Garage> {
    return this._http.post<Garage>(this.apiUrl, garage);
  }

  deleteGarage(garageCuit: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${garageCuit}`);
  }

  updateGarage(garage: any): Observable<Garage> {
    return this._http.put<Garage>(`${this.apiUrl}/${garage.cuit}`, garage);
  }
}