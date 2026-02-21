import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reservation, Garage, AvailabilityResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservations`;
  private apiAvailables = `${environment.apiUrl}/garages/availables`;

  createReservation(reservationData: any): Observable<Reservation> {
    return this._http.post<Reservation>(this.apiUrl, reservationData);
  }

  getGaragesAvailables(filters: { check_in_at: string; check_out_at: string; license_plate: string }): Observable<Garage[]> {
    const params = new HttpParams()
      .set('check_in_at', filters.check_in_at)
      .set('check_out_at', filters.check_out_at)
      .set('license_plate', filters.license_plate);

    return this._http.get<Garage[]>(this.apiAvailables, { params });
  }

  updateReservation(reservationData: Reservation): Observable<Reservation> {
    return this._http.put<Reservation>(`${this.apiUrl}/${reservationData.id}`, reservationData);
  }

  getReservationsByUser(userId: number | string): Observable<Reservation[]> {
    return this._http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  getReservationsOfGarage(cuit: string, condition: boolean, filters?: {
    vehicleLicensePlate?: string;
    status?: string;
    checkInDate?: string;
    checkOutDate?: string;
  }): Observable<Reservation[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.vehicleLicensePlate) params = params.append('license_plate', filters.vehicleLicensePlate);
      if (filters.status)              params = params.append('status', filters.status);
      if (filters.checkInDate)         params = params.append('check_in_at', filters.checkInDate);
      if (filters.checkOutDate)        params = params.append('check_out_at', filters.checkOutDate);
    }
    return this._http.get<Reservation[]>(`${this.apiUrl}/garage/${cuit}/${condition}`, { params });
  }

  cancelReservation(reservationId: number | string): Observable<void> {
    return this._http.patch<void>(`${this.apiUrl}/${reservationId}/cancel`, {});
  }

  BlockedSpacesByGarage(cuit: string): Observable<Reservation[]> {
    return this._http.get<Reservation[]>(`${this.apiUrl}/garage/${cuit}/list`);
  }

  getReservationsForBlocking(cuit: string): Observable<Reservation[]> {
    return this._http.get<Reservation[]>(`${this.apiUrl}/blocking-data/${cuit}`);
  }

  checkVehicleAvailability(plate: string, checkIn: string, checkOut: string): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('license_plate', plate)
      .set('check_in_at', checkIn)
      .set('check_out_at', checkOut);

    return this._http.get<AvailabilityResponse>(`${this.apiUrl}/check-availability`, { params });
  }

  updateServiceStatus(reservationId: number, serviceId: number, status: string): Observable<void> {
    return this._http.patch<void>(`${this.apiUrl}/${reservationId}/services/${serviceId}`, { status });
  }
}