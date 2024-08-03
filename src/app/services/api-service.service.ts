import { HttpClient } from '@angular/common/http';
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
}
