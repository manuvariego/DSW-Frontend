import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service.js';
import { UsersService } from '../../services/users.service.js';
import { AuthService } from '../../services/auth.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';
import { error } from 'console';
import { Router } from '@angular/router';



@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})

export class ReservationComponent implements OnInit {
  errorMessage: string = '';
  errorDateInvalid: string = '';
  reservationForm!: FormGroup;
  isDateInvalid: boolean = false;

  reservationData = {

    check_in_at: '',
    check_out_at: '',
    license_plate: '',
    cuitGarage: '',

  }

  filters = {
    check_in_at: '',
    check_out_at: '',
    license_plate: '',

  }

  constructor(
  private fb: FormBuilder, 
  private reservationService: ReservationService, 
  private authService: AuthService, 
  private router: Router) {}  
  private _apiservice = inject(UsersService)
  private _apiserviceGarage = inject(GaragesService)
  

  userID: string = ''
  userVehicles: any[] = []
  Garages: any[] = []
  theReservation: any = null
  availableServices: any[] = [];     // Los servicios que BRINDA la cochera 
  selectedServicesIds: number[] = []; // Los servicios que ELIGE el cliente 
  totalExtra: number = 0; // Para sumar $$ al precio final
  selectedGarageName: string = '';
  currentSection: any = 'initial';
  paymentMethod: string = ''; //  efectivo o mercado pago

ngOnInit() {
    // para saber que usuario es el que está haciendo la reserva
    const storedId = this.authService.getCurrentUserId(); 

    if (storedId) {
      this.userID = storedId;
      console.log("Usuario detectado ID:", this.userID);
      
      // buscamos los vehículos de ese usuario
      this.getUserVehicles();
    } else {
      console.warn("No hay usuario logueado.");
      this.router.navigate(['/login']); // Si no hay usuario, se va al login
    }
  }

  getUserVehicles() {
    this._apiservice.getUserVehicles(this.userID).subscribe({
      next: (data: any) => {
        console.log("Vehículos cargados:", data);
        this.userVehicles = data;
      },
      error: (error) => {
        console.error("Error cargando vehículos:", error);
        this.errorMessage = "No se pudieron cargar tus vehículos.";
      }
    });
  }
  

  getGaragesAvailables() {
    this.reservationService.getGaragesAvailables(this.filters).subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.Garages = data;
        } else {
          this.Garages = [data];
        }
        this.errorMessage = ''; // Limpiar mensaje de error si la solicitud es exitosa
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener cocheras disponibles:', error);
        this.errorMessage = 'Error al obtener los datos. Verifique la información ingresada e intente nuevamente.';
      }
    );
  }

  validateDates() {
    const checkIn = new Date(this.reservationData.check_in_at);
    const checkOut = new Date(this.reservationData.check_out_at);


    // Opcional: Si hay un campo específico para mostrar errores de fecha
    if (checkIn > checkOut) {
      this.errorDateInvalid = 'La fecha de entrada no puede ser posterior a la fecha de salida.';
      this.isDateInvalid = true;
    } else if (checkIn < new Date()) {
      this.errorDateInvalid = 'La fecha de entrada no puede ser anterior a hoy';
      this.isDateInvalid = true;
    } else {
      this.errorDateInvalid = ''; // Limpia el mensaje de error si las fechas son válidas
      this.isDateInvalid = false;
    }
  }



  saveGarage(aGarage: any) {
    this.reservationData.cuitGarage = aGarage.cuit
    this.selectedGarageName = aGarage.name
    this.availableServices = aGarage.services || [];
    
    this.selectedServicesIds = [];
    this.totalExtra = 0;
    this.currentSection = 'services';
  }

  onServiceChange(event: any, service: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedServicesIds.push(service.id);
      this.totalExtra += Number(service.price); 
    } else {
      this.selectedServicesIds = this.selectedServicesIds.filter(id => id !== service.id);
      this.totalExtra -= Number(service.price);
    }
  }

  // métodos para que se haga el pago 
  
  goToPaymentSection() {
    this.currentSection = 'payment';
  }

  selectPaymentMethod(method: string) {
    this.paymentMethod = method;
  }

  createReservation() {
    const finalData = {
      ...this.reservationData, 
      services: this.selectedServicesIds 
    };

    console.log("Enviando reserva con servicios:", finalData);

    this.reservationService.createReservation(finalData).subscribe({
      next: (response) => {
        console.log('Reserva creada exitosamente:', response);
        this.theReservation = response;
        this.currentSection = 'realizada'; 
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.errorMessage = 'Hubo un error al procesar la reserva.';
      }
    });
  }

  showSection(section: string) {
    this.currentSection = section;

    if (this.currentSection == 'garages') {
      this.getGaragesAvailables();
    }
  }
}



