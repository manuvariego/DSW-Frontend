import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private userService = inject(UsersService);
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  remember = true;
  errorMessage = '';

  onSubmit() {
    this.errorMessage = '';

    const credentials = {
      dni: this.username,
      password: this.password
    };

    this.userService.login(credentials).subscribe({
      next: (response: any) => {
        // Guardamos sesión
        this.authService.saveSession(response);

        // Redirección según rol
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        if (error.status === 401) {
          this.errorMessage = 'DNI o contraseña incorrectos.';
        } else {
          this.errorMessage = 'Error del servidor. Intente más tarde.';
        }
      }
    });
  }
}
