import { HttpClient, HttpParams} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private _http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/reservations';
  private apiAvailables = 'http://localhost:3000/api/garages/availables';

  constructor(private http: HttpClient) { }

  createReservation(reservationData: any): Observable<any> {
    return this.http.post(this.apiUrl, reservationData);
  }

  getGaragesAvailables(filters: any): Observable<any[]>{

    let params = new HttpParams()
        .set('check_in_at', filters.check_in_at)
        .set('check_out_at', filters.check_out_at)
        .set('license_plate', filters.license_plate);

    return this.http.get<any[]>(this.apiAvailables, { params });

}
}