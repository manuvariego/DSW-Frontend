import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})


//ESTA MAL MANEJAR COCHERAS DESDE ESTE ARCHIVO CREO YO

export class ServiceService {
  private testapiUrl = `/api`
  private apiUrl = `${environment.apiUrl}/services`;
  constructor(private http: HttpClient) { }

  getAllServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  createService(serviceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, serviceData);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getGarageByCuit(cuit: number): Observable<any> {
    return this.http.get<any>(`${this.testapiUrl}/garages/${cuit}`);
  }

  updateGarageServices(cuit: number, servicesIds: number[]): Observable<any> {
    return this.http.put(`${this.testapiUrl}/garages/${cuit}`, { services: servicesIds });
  }

  updateService(service: { id: any; description: string; price: number; garageId: string }) {
  return this.http.put(`/api/services/${service.id}`, service);
}

}
