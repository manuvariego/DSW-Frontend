import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TypeVehicleService {

  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/typeVehicles`;

  getTypeVehicles(): Observable<any[]> {
    return this._http.get<any[]>(this.apiUrl);
  }

  createTypeVehicle(typeVehicle: any): Observable<any> {
    return this._http.post<any>(this.apiUrl, typeVehicle);
  } 
  

  deleteTypeVehicle(idType: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/${idType}`);
  }

  updateTypeVehicle(typeVehicle: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${typeVehicle.id}`, typeVehicle);
  }

  getTypeVehicle(idType: string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${idType}`)
  }


}
