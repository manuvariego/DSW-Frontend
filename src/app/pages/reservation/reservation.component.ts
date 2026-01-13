import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service.js';
import { UsersService } from '../../services/users.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';
import { error } from 'console';



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

  constructor(private fb: FormBuilder, private reservationService: ReservationService) { }

  private _apiservice = inject(UsersService)
  private _apiserviceGarage = inject(GaragesService)
  

  userID: string = ''

  ngOnInit() {
  
    this.getVehicles()
}

  getVehicles() {

    this._apiservice.getUser((this.userID)).subscribe((user: any) => {

      console.log(user)

      this.userVehicles = user.vehicles
    })


  }

  Garages: any[] = []

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

    this.createReservation()

    this.currentSection = 'realizada'


  }

  theReservation: any = null

  createReservation() {
    this.reservationService.createReservation(this.reservationData).subscribe({
      next: (response) => {
        console.log('Reserva creada exitosamente:', response);
        this.theReservation = response
      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
      }
    });
  }



  userVehicles: any[] = []
  /*
    onSubmit() {
        this.reservationService.createReservation(this.reservationData).subscribe({
          next: (res) => {
            console.log('Reserva creada!', res);
          },
          error: (err) => {
            console.error('Error creando reserva', err);
          }
        });
    }
    */

  currentSection: any = 'initial'

  showSection(section: string) {
    this.currentSection = section;

    if (this.currentSection == 'garages') {
      this.getGaragesAvailables()
    }
  }
}
