import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../services/service.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServiceComponent implements OnInit {

  myServices: any[] = [];
  garageCuit: any = '';


  newService = {
    description: '',
    price: null
  };

  isLoading = true;
  message = '';

  constructor(private serviceService: ServiceService) { }

  ngOnInit(): void {
    const cuit = localStorage.getItem('userId');
    console.log("CUIT")
    console.log(cuit)
    console.log("CUIT")
    // Usamos el CUIT del localStorage o uno por defecto para probar
    this.garageCuit = cuit ? Number(cuit) : 55555;
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    this.serviceService.getGarageByCuit(this.garageCuit).subscribe({
      next: (garage) => {
        this.myServices = garage.services || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando cochera', err);
        this.message = 'Error al cargar los datos.';
        this.isLoading = false;
      }
    });
  }

  addService() {
    if (!this.newService.description || !this.newService.price) {
      this.message = 'Por favor completa descripción y precio.';
      return;
    }

    const dataToSend = {
      garageCuit: this.garageCuit,
      description: this.newService.description,
      price: Number(this.newService.price)
    };

    this.isLoading = true;

    this.serviceService.createService(dataToSend).subscribe({
      next: (response) => {
        this.message = '¡Servicio agregado!';

        this.newService = { description: '', price: null };

        this.loadData();

        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.message = 'Error al crear el servicio.';
        console.error(err);
      }
    });
  }

  deleteService(serviceId: number) {
    if (!confirm('¿Eliminar este servicio?')) return;

    this.isLoading = true;

    this.serviceService.deleteService(serviceId).subscribe({
      next: () => {
        this.message = 'Servicio eliminado.';
        this.loadData();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.message = 'Error al eliminar.';
        console.error(err);
      }
    });
  }
}
