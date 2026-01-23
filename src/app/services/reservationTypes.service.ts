import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationTypesService {
  private _http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/reservationTypes';

  getReservationTypes(): Observable<any[]> {
    return this._http.get<any[]>(this.apiUrl);
  }

  getReservationType(desc: string, cuit:string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${desc}/${cuit}`)
}

  createReservationType(reservationType: any): Observable<any> {
    return this._http.post<any>(this.apiUrl, reservationType);
  } 
  

  deleteReservationType(desc: string, cuit:string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/${desc}/${cuit}`);
  }

  updateReservationType(reservationType: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${reservationType.description}/${reservationType.garage}`, reservationType);
  }

  getPricingStatus(cuit: string): Observable<any> {
    return this._http.get<any>(`${this.apiUrl}/garage/${cuit}/status`);
  }

  getReservationTypesByGarage(cuit: string): Observable<any[]> {
    return this._http.get<any[]>(`${this.apiUrl}/garage/${cuit}`);
  }

}