import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Garage, GarageService } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = `${environment.apiUrl}/services`;
  private garagesUrl = `${environment.apiUrl}/garages`;

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<GarageService[]> {
    return this.http.get<GarageService[]>(this.apiUrl);
  }

  createService(serviceData: Partial<GarageService> & { garageCuit: number }): Observable<GarageService> {
    return this.http.post<GarageService>(this.apiUrl, serviceData);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGarageByCuit(cuit: number): Observable<Garage> {
    return this.http.get<Garage>(`${this.garagesUrl}/${cuit}`);
  }

  updateGarageServices(cuit: number, servicesIds: number[]): Observable<Garage> {
    return this.http.put<Garage>(`${this.garagesUrl}/${cuit}`, { services: servicesIds });
  }

  updateService(service: { id: number; description: string; price: number; garageId: string }): Observable<GarageService> {
    return this.http.put<GarageService>(`${this.apiUrl}/${service.id}`, service);
  }
}