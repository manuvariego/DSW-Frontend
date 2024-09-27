import { HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private _http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient) { }

  createReservation(reservationData: any): Observable<any> {
    return this.http.post(this.apiUrl, reservationData);
  }

  getTiposEstadia(): Observable<any[]> {
    return this.http.get<any[]>('/api/tipos-estadia');
  }

  
}
