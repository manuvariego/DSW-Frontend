import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service.js';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  private _authService = inject(AuthService);
  private _usersService = inject(UsersService);
  private _reservationService = inject(ReservationService);

  user: any = {}; 
  isLoading = true;
  message = '';
  isSuccess = false;
  stats = {
    totalSpent: 0,
    completedReservations: 0,
    favoriteGarage: '---'
  };

  ngOnInit() {
    const userId = this._authService.getCurrentUserId();
    if (userId) {
      this.loadUserData(userId);
      this.loadUserStats(userId);
    }
  }

  loadUserData(id: string | number) {
    this._usersService.getUser(id).subscribe({
      next: (data) => {
        this.user = {
          id: data.id,
          name: data.name,
          lastname: data.lastname,
          phoneNumber: data.phoneNumber,
          email: data.email,
          dni: data.dni
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

updateProfile() {
  this.isLoading = true;
  this.message = '';

  const dataToUpdate = {
    name: this.user.name,
    lastname: this.user.lastname,
    phoneNumber: this.user.phoneNumber,
    email: this.user.email 
  };

  this._usersService.update({
    id: this.user.id,
    ...dataToUpdate
  }).subscribe({
    next: () => {
      this.message = '¡Datos actualizados correctamente!';
      this.isSuccess = true;
      this.isLoading = false;

      setTimeout(() => this.message = '', 3000);
    },
    error: (err) => {
      console.error(err);
      this.message = 'Error al actualizar los datos.';
      this.isSuccess = false;
      this.isLoading = false;
    }
  });
}


loadUserStats(userId: string | number) {
    
    this._reservationService.getReservationsByUser(userId).subscribe({
      next: (reservation: any[]) => {
        console.log("Reservas del usuario para estadísticas:", reservation);
        if (!reservation || reservation.length === 0) {
          this.stats = { totalSpent: 0, completedReservations: 0, favoriteGarage: 'Todavía no tenes una cochera favorita' };
          return;
        }
        const completedReservations = reservation.filter(r => 
            r.estado?.toLowerCase() === 'completada' ||
            r.estado?.toLowerCase() === 'activa'
        );
        this.stats.totalSpent = completedReservations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        this.stats.completedReservations = completedReservations.length;
        const garageNames = completedReservations
            .map(r => r.garage?.name || 'Desconocida');

        this.stats.favoriteGarage = this.getMostFrequent(garageNames);
      },
      error: (err) => {
        console.error("Error al cargar estadísticas:", err);
      }
    });
  }

  getMostFrequent(arr: string[]): string {
    if (arr.length === 0) return 'Todavía no tenes una cochera favorita';
    
    const counts: {[key: string]: number} = {};
    let maxCount = 0;
    let mostFrequent = 'Todavía no tenes una cochera favorita';
    for (const item of arr) {
        if (item === 'Desconocida') continue; 
        counts[item] = (counts[item] || 0) + 1;
        if (counts[item] > maxCount) {
            maxCount = counts[item];
            mostFrequent = item;
        }
    }
    return mostFrequent;
  }
}