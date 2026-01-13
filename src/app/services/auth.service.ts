import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class AuthService {

  saveSession(response: any) {
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


  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isUser(): boolean {
    return this.getRole() === 'user';
  }
}
