import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this._http.get<User[]>(this.apiUrl);
  }

  getUser(userId: string | number): Observable<User> {
    return this._http.get<User>(`${this.apiUrl}/${userId}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this._http.post<User>(this.apiUrl, user);
  }

  delete(userId: string | number): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  update(user: any): Observable<User> {
    return this._http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }
}