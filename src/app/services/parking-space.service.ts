import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParkingSpaceService {

    private _http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/parkingSpaces`;
  
    getParkingSpaces(): Observable<any[]>{
      return this._http.get<any[]>(this.apiUrl);
    }
  
    getParkingSpace(numberParkingSpace: string, cuitGarage: string): Observable<any>{
      return this._http.get<any>(`${this.apiUrl}/${numberParkingSpace}/${cuitGarage}`)
    }

    getParkingSpaceOfGarage(cuitGarage: string): Observable<any>{
      return this._http.get<any>(`${this.apiUrl}/${cuitGarage}`)
    }
  
    createParkingSpace(parkingSpace: any): Observable<any> {
      return this._http.post<any>(this.apiUrl, parkingSpace);
    } 
    
    deleteParkingSpace(numberParkingSpace: string, cuitGarage:String): Observable<any> {
      return this._http.delete(`${this.apiUrl}/${numberParkingSpace}/${cuitGarage}`);
    }
  
    updateParkingSpace(parkingSpace: any): Observable<any> {
      return this._http.put(`${this.apiUrl}/${parkingSpace.number}/${parkingSpace.garage}`, parkingSpace);
    }
  
    
  
} 
  
  
  
  

