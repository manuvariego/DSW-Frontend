import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservations`;
  private apiAvailables = `${environment.apiUrl}/garages/availables`;

  constructor(private http: HttpClient) { }

  createReservation(reservationData: any): Observable<any> {
    return this.http.post(this.apiUrl, reservationData);
  }


  getGaragesAvailables(filters: any): Observable<any> {

    let params = new HttpParams()
      .set('check_in_at', filters.check_in_at)
      .set('check_out_at', filters.check_out_at)
      .set('license_plate', filters.license_plate);

    return this.http.get<any>(this.apiAvailables, { params });

  }

  updateReservation(reservationData: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${reservationData.id}`, reservationData);
  }




}