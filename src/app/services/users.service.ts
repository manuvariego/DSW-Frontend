import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable , tap} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;


  getUsers(): Observable<any[]>{
    return this._http.get<any[]>(this.apiUrl);
  }

  getUser(userId: string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${userId}`)
  }

  createUser(user: any): Observable<any> {
    return this._http.post<any>(this.apiUrl, user);
  } 
  
  delete(userId: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}/${userId}`);
  }

  update(user: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${user.id}`, user);
  }

  getUserReservations(userId: string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${userId}/reservations`)
  }

  getUserVehicles(userId: string): Observable<any>{
    return this._http.get<any>(`${this.apiUrl}/${userId}/vehicles`)
  }

} 



