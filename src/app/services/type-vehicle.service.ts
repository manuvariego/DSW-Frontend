import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VehicleType } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TypeVehicleService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/typeVehicles`;

  getTypeVehicles(): Observable<VehicleType[]> {
    return this._http.get<VehicleType[]>(this.apiUrl);
  }

  createTypeVehicle(typeVehicle: Partial<VehicleType>): Observable<VehicleType> {
    return this._http.post<VehicleType>(this.apiUrl, typeVehicle);
  }

  deleteTypeVehicle(idType: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${idType}`);
  }

  updateTypeVehicle(typeVehicle: VehicleType): Observable<VehicleType> {
    return this._http.put<VehicleType>(`${this.apiUrl}/${typeVehicle.id}`, typeVehicle);
  }

  getTypeVehicle(idType: string): Observable<VehicleType> {
    return this._http.get<VehicleType>(`${this.apiUrl}/${idType}`);
  }
}