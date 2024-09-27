import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service.js';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})
export class ReservationComponent implements OnInit {
  
  reservationForm!: FormGroup;

  constructor(private fb: FormBuilder, private reservationService: ReservationService) { }

  ngOnInit() {
    this.reservationForm = this.fb.group({
      license_plate: ['', Validators.required],
      tipoEstadiaId: ['', Validators.required],
      fechaHoraInicio: ['', Validators.required],
      fechaHoraFin: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      this.reservationService.createReservation(this.reservationForm.value).subscribe({
        next: (res) => {
          console.log('Reserva creada!', res);
        },
        error: (err) => {
          console.error('Error creando reserva', err);
        }
      });
    } else {
      console.log('Formulario no es válido');
    }
  }
}{

}
