import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: { dni: string; password: string }): Observable<any> {
    return this._http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  saveSession(response: any) {
    console.log(response);
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.user.id);
    localStorage.setItem('userName', response.user.name);
    localStorage.setItem('userRole', response.user.type);

  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserName(): string | null {
  return localStorage.getItem('userName');
}


  isGarage(): boolean {
    return this.getRole() === 'garage';
  }

  isUser(): boolean {
    return this.getRole() === 'user';
  }
}
