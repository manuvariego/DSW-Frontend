import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../services/service.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServiceComponent implements OnInit {

  myServices: any[] = [];
  garageCuit: any = '';
  isEditing: boolean = false; 
  editingId: number | null = null; 

  newService = {
    description: '',
    price: null
  };

  isLoading = true;
  message = '';
  messageType: 'success' | 'error' = 'success';

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
        this.messageType = 'error';
        this.message = 'Error al cargar los datos.';
        this.isLoading = false;
      }
    });
  }

  editService(service: any) {
    this.isEditing = true;
    this.editingId = service.id;
    this.newService = { 
      description: service.description, 
      price: service.price 
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingId = null;
    this.newService = { description: '', price: null };
  }

  updateService() {
    if (!this.editingId) return;
    const serviceToUpdate = {
      id: this.editingId,
      description: this.newService.description,
      price: Number(this.newService.price) || 0,
      garageId: this.garageCuit 
    };

    this.isLoading = true; 

    this.serviceService.updateService(serviceToUpdate).subscribe({
      next: (response) => {
        console.log('Servicio actualizado:', response);
        this.messageType = 'success';
        this.message = 'Servicio actualizado correctamente.';

        this.loadData();
        this.cancelEdit();
        this.isLoading = false;
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.messageType = 'error';
        this.message = 'Error al actualizar el servicio. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  addService() {
    if (!this.newService.description || !this.newService.price) {
      this.messageType = 'error';
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
        this.messageType = 'success';
        this.message = 'Servicio agregado correctamente.';

        this.newService = { description: '', price: null };

        this.loadData();

        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.messageType = 'error';
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
        this.messageType = 'success';
        this.message = 'Servicio eliminado correctamente.';
        this.loadData();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.messageType = 'error';
        this.message = 'Error al eliminar el servicio.';
        console.error(err);
      }
    });
  }
}
