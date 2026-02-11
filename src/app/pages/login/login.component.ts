import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import Swal from 'sweetalert2'; 

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
  private socketService = inject(SocketService);

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
    console.log(this.username)
    console.log(this.password)

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
        
        // Unirse a la sala de Socket.io según el rol
        this.socketService.joinRoom();

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
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

async onForgotPassword() {
  const { value: email } = await Swal.fire({
    title: 'Recuperar Contraseña',
    input: 'email',
    inputLabel: 'Ingresá tu correo electrónico',
    inputPlaceholder: 'ejemplo@correo.com',
    showCancelButton: true,
    confirmButtonText: 'Enviar Link',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#212529', 
    inputValidator: (value: string) => {
      if (!value) {
        return '¡Necesitás escribir un email!';
      }
      return null;
    }
  });

  if (email) {
    Swal.fire({
      title: 'Enviando...',
      text: 'Por favor esperá un momento',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); 
      }
    });

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        Swal.fire(
          '¡Enviado!',
          'Revisá tu correo para seguir los pasos.',
          'success'
        );
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo enviar el correo.', 'error');
      }
    });
  }

}}
