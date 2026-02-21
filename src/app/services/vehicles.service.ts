import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vehicle } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehicles`;

  getVehicles(): Observable<Vehicle[]> {
    return this._http.get<Vehicle[]>(this.apiUrl);
  }

  createVehicle(vehicle: any): Observable<Vehicle> {
    return this._http.post<Vehicle>(this.apiUrl, vehicle);
  }

  deleteVehicle(license_plate: string): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${license_plate}`);
  }

  updateVehicle(vehicle: any): Observable<Vehicle> {
    return this._http.put<Vehicle>(`${this.apiUrl}/${vehicle.license_plate}`, vehicle);
  }

  getVehicle(licensePlate: string): Observable<Vehicle> {
    return this._http.get<Vehicle>(`${this.apiUrl}/${licensePlate}`);
  }

  getVehiclesByOwner(ownerId: number): Observable<Vehicle[]> {
    return this._http.get<Vehicle[]>(`${this.apiUrl}/owner/${ownerId}`);
  }
}