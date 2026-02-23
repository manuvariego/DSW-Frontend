import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ParkingSpace } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ParkingSpaceService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/parkingSpaces`;

  getParkingSpaces(): Observable<ParkingSpace[]> {
    return this._http.get<ParkingSpace[]>(this.apiUrl);
  }

  getParkingSpace(numberParkingSpace: string, cuitGarage: string): Observable<ParkingSpace> {
    return this._http.get<ParkingSpace>(`${this.apiUrl}/${numberParkingSpace}/${cuitGarage}`);
  }

  getParkingSpaceOfGarage(cuitGarage: string): Observable<ParkingSpace[]> {
    return this._http.get<ParkingSpace[]>(`${this.apiUrl}/${cuitGarage}`);
  }

  createParkingSpace(parkingSpace: any): Observable<ParkingSpace> {
    return this._http.post<ParkingSpace>(this.apiUrl, parkingSpace);
  }

  deleteParkingSpace(numberParkingSpace: string, cuitGarage: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${numberParkingSpace}/${cuitGarage}`);
  }

  updateParkingSpace(parkingSpace: any): Observable<ParkingSpace> {
    return this._http.put<ParkingSpace>(`${this.apiUrl}/${parkingSpace.number}/${parkingSpace.garage}`, parkingSpace);
  }
}