import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class ServiceService {
private apiUrl = 'http://localhost:3000/api'; 

constructor(private http: HttpClient) { }

getAllServices(): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/services`);
}

getGarageByCuit(cuit: number): Observable<any> {
return this.http.get<any>(`${this.apiUrl}/garages/${cuit}`);
}

updateGarageServices(cuit: number, servicesIds: number[]): Observable<any> {
return this.http.put(`${this.apiUrl}/garages/${cuit}`, { services: servicesIds });
}

}