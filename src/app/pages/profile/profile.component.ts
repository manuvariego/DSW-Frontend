import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { GaragesService } from '../../services/garages.service';
import { LocationsService } from '../../services/locations.service';
import { Router, RouterLink } from '@angular/router';

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
  private _garagesService = inject(GaragesService);
  private _locationsService = inject(LocationsService);
  private _router = inject(Router);

  // Common
  isLoading = true;
  message = '';
  isSuccess = false;
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
      }
    }
  }

  loadUserData(id: string) {
    this._usersService.getUser(id).subscribe({
      next: (data) => {
        this.user = data;
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
      next: (res) => {
        this.message = '¡Datos actualizados correctamente!';
        this.isSuccess = true;
        this.isLoading = false;
        this.isEditing = false;

        // Update navbar name if changed
        if (this.user.name) {
          localStorage.setItem('userName', this.user.name);
        }

        // Clear message after 4 seconds
        setTimeout(() => {
          this.message = '';
        }, 4000);
      },
      error: (err) => {
        console.error(err);
        this.message = 'Error al actualizar los datos.';
        this.isSuccess = false;
        this.isLoading = false;
      }
    });
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
      next: (res) => {
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