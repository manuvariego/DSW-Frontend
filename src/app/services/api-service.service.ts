import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  private _http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';

  getUsers(): Observable<any[]>{
    return this._http.get<any[]>(this.apiUrl);
  }

  getUser(): Observable<any>{
    return this._http.get<any>(this.apiUrl)
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

  

  } 



