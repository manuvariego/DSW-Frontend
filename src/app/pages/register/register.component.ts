import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { GaragesService } from '../../services/garages.service';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private userService = inject(UsersService);
  private garageService = inject(GaragesService);
  private locationService = inject(LocationsService);
  private router = inject(Router);

  // Paso 1: Selección de tipo de cuenta
  currentStep: 'selectType' | 'registerUser' | 'registerGarage' = 'selectType';
  accountType: 'user' | 'garage' | null = null;

  errorMessage = '';
  successMessage = '';
  locations: any[] = [];

  // Datos para registro de usuario
  userData = {
    dni: '',
    name: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    address: '',
    email: '',
    phoneNumber: '',
    role: 'user'
  };

  // Datos para registro de cochera
  garageData = {
    cuit: '',
    name: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
    email: '',
    location: ''
  };

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.locationService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (error) => {
        console.error('Error al cargar localidades:', error);
      }
    });
  }

  selectAccountType(type: 'user' | 'garage') {
    this.accountType = type;
    this.currentStep = type === 'user' ? 'registerUser' : 'registerGarage';
    this.errorMessage = '';
  }

  backToSelection() {
    this.currentStep = 'selectType';
    this.accountType = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  registerUser() {
    this.errorMessage = '';

    // Validación de contraseñas
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    const userPayload = {
      dni: this.userData.dni,
      name: this.userData.name,
      lastname: this.userData.lastname,
      password: this.userData.password,
      address: this.userData.address,
      email: this.userData.email,
      phoneNumber: this.userData.phoneNumber,
      role: 'user'
    };

    this.userService.createUser(userPayload).subscribe({
      next: (response) => {
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage = 'El DNI ya está registrado.';
        } else {
          this.errorMessage = 'Error al registrar usuario. Intente más tarde.';
        }
      }
    });
  }

  registerGarage() {
    this.errorMessage = '';

    // Validación de contraseñas
    if (this.garageData.password !== this.garageData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.garageData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    const garagePayload = {
      cuit: this.garageData.cuit,
      name: this.garageData.name,
      password: this.garageData.password,
      address: this.garageData.address,
      phoneNumber: this.garageData.phoneNumber,
      email: this.garageData.email,
      location: this.garageData.location
    };

    this.garageService.createGarage(garagePayload).subscribe({
      next: (response) => {
        this.successMessage = 'Cochera registrada exitosamente. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage = 'El CUIT ya está registrado.';
        } else {
          this.errorMessage = 'Error al registrar cochera. Intente más tarde.';
        }
      }
    });
  }
}
