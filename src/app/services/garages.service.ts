import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GaragesService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/garages`;

  getGarages(): Observable<any[]>{
    return this._http.get<any[]>(this.apiUrl);
  }

  getGarage(garageCuit: string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${garageCuit}`)
  }

  createGarage(garage: any): Observable<any> {
    return this._http.post<any>(this.apiUrl, garage);
  } 

  deleteGarage(garageCuit: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/${garageCuit}`);
  }

  updateGarage(garage: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${garage.cuit}`, garage);
  }



 } 