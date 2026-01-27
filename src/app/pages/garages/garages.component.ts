import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';
import { LocationsService } from '../../services/locations.service.js';
import {ParkingSpaceService} from '../../services/parking-space.service.js';
import { TypeVehicleService } from '../../services/type-vehicle.service.js';
import { AuthService } from '../../services/auth.service.js';
import { ReservationService } from '../../services/reservation.service.js';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './garages.component.html',
  styleUrl: './garages.component.css'
})
export class GaragesComponent {
  currentSection: string = 'initial';
  garageList: any[] = [];
  private _apiservice = inject(GaragesService);
  private __apiservice = inject(ParkingSpaceService);
  private ___apiservice = inject(ReservationService);
  private _locationService = inject(LocationsService);
  private _typeVehicleService = inject(TypeVehicleService);
  private _authService = inject(AuthService);
  garageCreado = false;
  garageCuit: any = '';
  aGarage: any = null;
  editingGarage: any = null;
  editingParkingSpace: any = null;
  typeVehicles: Array<any> = [];
  ReservationsList: any[] = []
  
  selectedReservation: any = null;
  
  reservationFilters = {
    vehicleLicensePlate: '',
    status: '',
    checkInDate: '',
    checkOutDate: ''
  };
  garageData = {

    cuit: '',
    name: '',
    password: '',
    address: '',
    phoneNumber: '',
    email: '',
    location: '',

  }

  ngOnInit() {
    this.loadLocations(); // Carga las localidades al iniciar
    this.loadTypeVehicles();
    this.loadReservationsOnProgress();
  }

  totalResevartionsOnProgress: number = 0;
  totalParkingSpaces: number = 0;
  totalParkingSpacesAvailable: number = 0;
  totalMoneyEarned: number = 0;
  totalReservationsAlltime: number = 0;

loadReservationsOnProgress() {
  const cuit = this._authService.getCurrentUserId();
  if (!cuit) {
    console.error('No CUIT found for current user.');
    return;
  }

  const now = new Date();
  const todayEnd = now.toLocaleString('sv-SE').replace(' ', 'T'); 
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayStart = startOfDay.toLocaleString('sv-SE').replace(' ', 'T');
  console.log('Fetching dashboard data...', { todayStart, todayEnd });

  const reservationsRequest$ = this.___apiservice.getReservationsOfGarage(cuit, false, { 
    status: 'pendiente' 
  });

  const reservationsRequest$$ = this.___apiservice.getReservationsOfGarage(cuit, false, { 
 
  });

  const spacesRequest$ = this.__apiservice.getParkingSpaceOfGarage(cuit);

  const revenueRequest$ = this.___apiservice.getReservationsOfGarage(cuit, true, { 
    status: 'finalizada', 
    checkInDate: todayStart, 
    checkOutDate: todayEnd 
  });

  forkJoin({
    reservations: reservationsRequest$,
    spaces: spacesRequest$,
    revenue: revenueRequest$,
    reservations2: reservationsRequest$$
  }).subscribe({
    next: (results) => {

      console.log('All dashboard data received:', results);

      this.totalResevartionsOnProgress = results.reservations ? results.reservations.length : 0;

      if (Array.isArray(results.spaces)) {
        this.totalParkingSpaces = results.spaces.length;
      } else {
        this.totalParkingSpaces = 0; 
      }
      this.totalMoneyEarned = (results.revenue as any).totalRevenue || 0;
      this.totalReservationsAlltime = results.reservations2 ? results.reservations2.length : 0;
      this.totalParkingSpacesAvailable = Math.max(0, this.totalParkingSpaces - this.totalResevartionsOnProgress);
      console.log(`Calculation Complete: ${this.totalParkingSpaces} Total - ${this.totalResevartionsOnProgress} Occupied = ${this.totalParkingSpacesAvailable} Available`);
    },
    error: (err) => {
      console.error('Error loading dashboard data:', err);
    }
  });
}

deleteReservation(reservationId: number) {
    const confirmation = confirm('¿Está seguro de que desea cancelar esta reserva?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    } 

    this.___apiservice.cancelReservation(reservationId).subscribe({
      next: (response) => {
        console.log('Reserva cancelada exitosamente', response);
        this.getReservation(); // Refresca la lista de reservas
      },
      error: (error) => {
        console.error('Error al cancelar la reserva', error);
      }
    });
  }

    modificarParkingSpace(parkingSpace: any) {
    this.currentSection = 'editParkingSpace';
    this.editingParkingSpace = { ...parkingSpace };
  }

   updateParkingSpace(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    const confirmation = confirm('¿Está seguro de que desea modificar este Space?');
    if (!confirmation) {
      return; // Si el Lugar de Estacionamiento cancela, no hacemos nada
    }

    this.__apiservice.updateParkingSpace(this.editingParkingSpace).subscribe({
      next: (response) => {
        console.log('Space actualizado exitosamente', response);
        this.editingParkingSpace = null; // Limpia la variable de edición;
        this.getParkingsSpaces(); // Refresca la lista de parkingSpace
        this.showSection('getParkingSpaces');
        form.resetForm();
      },
      error: (error) => {
        console.error('Error al actualizar el Lugar de Estacionamiento', error);
      }
    });
  }
  
   getReservation() {
    const cuit = this._authService.getCurrentUserId();

    if (!cuit) return;

    const filters = {
      vehicleLicensePlate: this.reservationFilters.vehicleLicensePlate,
      status: this.reservationFilters.status,
      checkInDate: this.reservationFilters.checkInDate,
      checkOutDate: this.reservationFilters.checkOutDate
    };

    // Pass filters to the service. The ReservationService's getReservationsOfGarage method
    // will need to be updated to accept these filter parameters.
    this.___apiservice.getReservationsOfGarage(cuit,false, filters).subscribe((data: any[]) => {

      if (Array.isArray(data)) {
        this.ReservationsList = data;
      } else {
        this.ReservationsList = [data]
      }
      console.log(data)
    })
  }

  // New method to apply filters (can be called from UI)
  applyReservationFilters() {
    this.getReservation();
  }

  viewReservationDetails(res: any) {
  this.selectedReservation = res;
  console.log(this.selectedReservation)
}
 
    ParkingSpaceData = {
    garage: 0,
    number: '',
    TypeVehicle: '',
  }

  parkingCreado = false;

  createParkingSpace(form: NgForm) {
    const cuit = this._authService.getCurrentUserId();
    const numericCuit = cuit ? parseInt(cuit, 10) : 0;

    this.ParkingSpaceData = {
    ...this.ParkingSpaceData,
    garage: numericCuit,
  }

    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.__apiservice.createParkingSpace(this.ParkingSpaceData).subscribe({
      next: (response) => {
        console.log('Lugar de Estacionamiento creado exitosamente:', response);
        this.parkingCreado = true;
        this.showSection('initial');
        form.resetForm();
        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.parkingCreado = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al crear Lugar de Estacionamiento:', error);
      }
    });
  }

  getParkingsSpaces() {
    const cuit = this._authService.getCurrentUserId();
    console.log(cuit);

    if (!cuit) return;
    this.garageCuit = cuit;
    this.__apiservice.getParkingSpaceOfGarage(cuit).subscribe((data: any[]) => {

      if (Array.isArray(data)) {
        this.garageList = data
      } else {
        this.garageList = [data]
      }
      console.log(data)
    })
  }

  getTypeVehicleName(id: any): string {
    const type = this.typeVehicles.find(t => t.id == id);
    return type ? type.name : 'Desconocido';
  }

  getGarages() {
    this._apiservice.getGarages().subscribe((data: any[]) => {

      if (Array.isArray(data)) {
        this.garageList = data

      } else {

        this.garageList = [data]
      }
      console.log(data)
    })
  }

  deleteParkingSpace(numberParkingSpace: string, tipo: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este Lugar de Estacionamiento?');
    if (!confirmation) {
      return;
    }

    this.__apiservice.deleteParkingSpace(numberParkingSpace, this.garageCuit).subscribe({
      next: (response) => {
        console.log('Lugar de Estacionamiento eliminado exitosamente', response);
        this.getParkingsSpaces();
      },
      error: (error) => {
        console.error('Error al eliminar el Lugar de Estacionamiento', error);
      }
    });

    if (tipo) { this.currentSection = 'initial'; }
  }

  // Método para actualizar la sección actual mostrada
  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getGarage') {
      this.getGarages()
    }

    if (section == 'getParkingSpaces') { 
      this.getParkingsSpaces() 
    }           

    if (section == 'getReservations') { 
      // Call getReservation with current filters when navigating to this section
      this.getReservation();
    }  
  }

  locations: Array<any> = []; // Array para almacenar las localidades

  loadLocations() {
    this._locationService.getLocations().subscribe(data => {
      this.locations = data;
    });
  }

  loadTypeVehicles() {
    this._typeVehicleService.getTypeVehicles().subscribe(data => {
      this.typeVehicles = data;
    });
  }
}