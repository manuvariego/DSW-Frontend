import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReservationType, PricingStatus } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReservationTypesService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservationTypes`;

  getReservationTypes(): Observable<ReservationType[]> {
    return this._http.get<ReservationType[]>(this.apiUrl);
  }

  getReservationType(desc: string, cuit: string): Observable<ReservationType> {
    return this._http.get<ReservationType>(`${this.apiUrl}/${desc}/${cuit}`);
  }

  createReservationType(reservationType: any): Observable<ReservationType> {
    return this._http.post<ReservationType>(this.apiUrl, reservationType);
  }

  deleteReservationType(desc: string, cuit: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${desc}/${cuit}`);
  }

  updateReservationType(reservationType: any): Observable<ReservationType> {
    return this._http.put<ReservationType>(
      `${this.apiUrl}/${reservationType.description}/${reservationType.garage}`,
      reservationType
    );
  }

  getPricingStatus(cuit: string): Observable<PricingStatus> {
    return this._http.get<PricingStatus>(`${this.apiUrl}/garage/${cuit}/status`);
  }

  getReservationTypesByGarage(cuit: string): Observable<ReservationType[]> {
    return this._http.get<ReservationType[]>(`${this.apiUrl}/garage/${cuit}`);
  }
}