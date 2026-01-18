import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private _http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/vehicles';

  getVehicles(): Observable<any[]> {
    return this._http.get<any[]>(this.apiUrl);
  }
  

  createVehicle(vehicle: any): Observable<any> {
    return this._http.post<any>(this.apiUrl, vehicle);
  } 
  

  deleteVehicle(license_plate: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/${license_plate}`);
  }

  updateVehicle(vehicle: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${vehicle.license_plate}`, vehicle);
  }

  getVehicle(licensePlate: string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${licensePlate}`)
  }

  getVehiclesByOwner(ownerId: number): Observable<any[]>{
    return this._http.get<any[]>(`${this.apiUrl}/owner/${ownerId}`)
  }
}