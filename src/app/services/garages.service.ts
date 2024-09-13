import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GaragesService {
  private _http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/garages';

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