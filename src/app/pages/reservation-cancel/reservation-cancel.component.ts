import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service.js';
import { UsersService } from '../../services/users.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';

@Component({
  selector: 'app-reservation-cancel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation-cancel.component.html',
  styleUrl: './reservation-cancel.component.css'
})
export class ReservationCancelComponent implements OnInit {

  private _apiservice = inject(UsersService)
  private resService = inject(ReservationService)

  ngOnInit() {

    this.getReservations()

  }


  userID: any = 1

  userReservations: any[] = []

  getReservations() {

    this._apiservice.getUserReservations((this.userID)).subscribe((data: any) => {

      console.log(data)

      this.userReservations = data
    })

  }

  reservationData = {
    id: '',
    date_time_reservation: '',
    check_in_at: '',
    check_out_at: '',
    estado: '',
    amount: '',
    vehicle: '',
    garage: '',
    parkingSpace: '',
  }


  updateReservation(reservation: any, type: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar esta reserva?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this.reservationData.id = reservation.id
    this.reservationData.date_time_reservation = reservation.date_time_reservation
    this.reservationData.check_in_at = reservation.check_in_at
    this.reservationData.check_out_at = reservation.check_out_at
    this.reservationData.estado = 'cancelada'
    this.reservationData.amount = reservation.amount
    this.reservationData.vehicle = reservation.vehicle
    this.reservationData.garage = reservation.garage
    this.reservationData.parkingSpace = reservation.parkingSpace


    this.resService.updateReservation(this.reservationData).subscribe({
      next: (response) => {
        this.getReservations();
        console.log(' Reserva eliminada exitosamente', response);
      },
      error: (error) => {
        console.error('Error al eliminar la reserva', error);
      }
    });


    if (type == true) { this.currentSection = 'initial' }
  }

  currentSection: any = 'initial'

  showSection(section: string) {
    this.currentSection = section;


  }



}
