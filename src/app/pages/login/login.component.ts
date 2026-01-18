import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  remember = true;
  errorMessage = '';
  isLoading = false;
  fieldErrors = {
    username: '',
    password: ''
  };

  validateFields(): boolean {
    this.fieldErrors = { username: '', password: '' };
    let isValid = true;

    // Validar identificación
    if (!this.username.trim()) {
      this.fieldErrors.username = 'Ingresa tu DNI o CUIT';
      isValid = false;
    } else if (!/^\d+$/.test(this.username.trim())) {
      this.fieldErrors.username = 'Solo se permiten números';
      isValid = false;
    }

    // Validar contraseña
    if (!this.password) {
      this.fieldErrors.password = 'Ingresa tu contraseña';
      isValid = false;
    } else if (this.password.length < 4) {
      this.fieldErrors.password = 'La contraseña es muy corta';
      isValid = false;
    }

    return isValid;
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.validateFields()) {
      return;
    }

    this.isLoading = true;

    const credentials = {
      dni: this.username.trim(),
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        this.authService.saveSession(response);

        if (this.authService.isGarage()) {
          this.router.navigate(['/garages']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Identificación o contraseña incorrectos';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Datos inválidos';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor';
        } else {
          this.errorMessage = 'Ocurrió un error. Intenta nuevamente';
        }
      }
    });
  }
}
