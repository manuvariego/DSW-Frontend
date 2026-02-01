import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { GaragesService } from '../../services/garages.service';
import { LocationsService } from '../../services/locations.service';
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
  private _garagesService = inject(GaragesService);
  private _locationsService = inject(LocationsService);

  // Common
  isLoading = true;
  message = '';
  isSuccess = false;
  stats = {
    totalSpent: 0,
    completedReservations: 0,
    favoriteGarage: '---'
  };
  isGarage = false;
  isEditing = false;

  // User data
  user: any = {};
  userBackup: any = {};

  // Garage data
  garage: any = {};
  garageBackup: any = {};
  locations: any[] = [];

  ngOnInit() {
    this.isGarage = this._authService.isGarage();
    const id = this._authService.getCurrentUserId();

    if (id) {
      if (this.isGarage) {
        this.loadLocations();
        this.loadGarageData(id);
      } else {
        this.loadUserData(id);
        this.loadUserStats(id);
      }
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

  startEditingUser() {
    this.userBackup = { ...this.user };
    this.isEditing = true;
    this.message = '';
  }

  cancelEditingUser() {
    this.user = { ...this.userBackup };
    this.isEditing = false;
    this.message = '';
  }

updateProfile() {
  this.isLoading = true;
  this.message = '';

  const dataToUpdate = {
        id: this.user.id,
    name: this.user.name,
    lastname: this.user.lastname,
    phoneNumber: this.user.phoneNumber,
    email: this.user.email
  };

  this._usersService.update(dataToUpdate).subscribe({
    next: () => {
      this.message = '¡Datos actualizados correctamente!';
      this.isSuccess = true;
      this.isLoading = false;
      this.isEditing = false;

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

  // === GARAGE METHODS ===

  loadLocations() {
    this._locationsService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      }
    });
  }

  loadGarageData(cuit: string) {
    this._garagesService.getGarage(cuit).subscribe({
      next: (data) => {
        this.garage = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading garage:', err);
        this.isLoading = false;
      }
    });
  }

  startEditing() {
    this.garageBackup = { ...this.garage };
    this.isEditing = true;
    this.message = '';
  }

  cancelEditing() {
    this.garage = { ...this.garageBackup };
    this.isEditing = false;
    this.message = '';
  }

  getLocationName(): string {
    if (!this.garage.location) return '-';
    const loc = typeof this.garage.location === 'object'
      ? this.garage.location
      : this.locations.find(l => l.id === this.garage.location);
    return loc ? `${loc.name}, ${loc.province}` : '-';
  }

  updateGarageProfile() {
    this.isLoading = true;
    this.message = '';

    const dataToUpdate = {
      cuit: this.garage.cuit,
      name: this.garage.name,
      phoneNumber: this.garage.phoneNumber,
      email: this.garage.email,
      address: this.garage.address,
      location: this.garage.location?.id || this.garage.location
    };

    this._garagesService.updateGarage(dataToUpdate).subscribe({
      next: () => {
        this.message = '¡Datos actualizados correctamente!';
        this.isSuccess = true;
        this.isLoading = false;
        this.isEditing = false;

        // Update navbar name if changed
        if (this.garage.name) {
          localStorage.setItem('userName', this.garage.name);
        }

        // Clear message after 4 seconds
        setTimeout(() => {
          this.message = '';
        }, 4000);
      },
      error: (err) => {
        console.error('Error updating garage:', err);
        this.message = 'Error al actualizar los datos.';
        this.isSuccess = false;
        this.isLoading = false;
      }
    });
  }
}