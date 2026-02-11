import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../services/service.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ReservationService } from '../../services/reservation.service.js';

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
  blockedServiceIds: string[] = [];

  newService = {
    description: '',
    price: null
  };

  isLoading = true;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private serviceService: ServiceService, private reservationService: ReservationService) { }

  ngOnInit(): void {
    const cuit = localStorage.getItem('userId');
    // Usamos el CUIT del localStorage o uno por defecto para probar
    this.garageCuit = cuit ? Number(cuit) : 55555;
    this.loadData();
    this.checkBlockedServices(this.garageCuit);
  }

  loadData() {
    this.isLoading = true;

    this.serviceService.getGarageByCuit(this.garageCuit).subscribe({
      next: (garage) => {
        this.myServices = garage.services || [];
        this.isLoading = false;
      },
      error: (err) => {
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
        this.messageType = 'success';
        this.message = 'Servicio actualizado correctamente.';

        this.loadData();
        this.cancelEdit();
        this.isLoading = false;
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
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
      }
    });
  }

  deleteService(serviceId: number) {
  Swal.fire({
    title: '¿Eliminar este servicio?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6', 
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    
    if (result.isConfirmed) {
      this.isLoading = true; 
      this.serviceService.deleteService(serviceId).subscribe({
        next: () => {
          this.isLoading = false;
          
          this.loadData(); 
          Swal.fire(
            '¡Eliminado!',
            'El servicio ha sido eliminado correctamente.',
            'success'
          );
        },
        error: (err) => {
          this.isLoading = false;

          if (err.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'No se puede eliminar',
              text: err.error.message || 'El servicio está siendo usado en una reserva.'
            });
          } else {
            Swal.fire(
              'Error',
              'Ocurrió un error inesperado al intentar eliminar.',
              'error'
            );
          }
        }
      });
    }
  });
}

checkBlockedServices(cuit: string) {
  this.reservationService.getReservationsForBlocking(cuit).subscribe({
    next: (reservations) => {

      const blockedSet = new Set<string>();

      reservations.forEach(r => {
        if (r.reservationServices && r.reservationServices.length > 0) {
          r.reservationServices.forEach((rs: any) => {
            // Guardamos el ID del servicio
            blockedSet.add(String(rs.service.id));
          });
        }
      });

      this.blockedServiceIds = Array.from(blockedSet);
    },
    error: () => {}
  });
}

// Función para el HTML
isServiceBlocked(serviceId: any): boolean {
  return this.blockedServiceIds.includes(String(serviceId));
}

}
