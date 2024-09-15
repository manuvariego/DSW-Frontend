import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingSpaceService {

    private _http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/parkingSpaces';
  
    getParkingSpaces(): Observable<any[]>{
      return this._http.get<any[]>(this.apiUrl);
    }
  
    getParkingSpace(numberParkingSpace: string): Observable<any>{
      return this._http.get<any>(`${this.apiUrl}/${numberParkingSpace}`)
    }
  
    createParkingSpace(parkingSpace: any): Observable<any> {
      return this._http.post<any>(this.apiUrl, parkingSpace);
    } 
    
    deleteParkingSpace(numberParkingSpace: string): Observable<any> {
      return this._http.delete(`${this.apiUrl}/${numberParkingSpace}`);
    }
  
    updateParkingSpace(parkingSpace: any): Observable<any> {
      return this._http.put(`${this.apiUrl}/${parkingSpace.number}`, parkingSpace);
    }
  
    
  
} 
  
  
  
  

