import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { RouterLink } from '@angular/router';

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

  user: any = {}; 
  isLoading = true;
  message = '';
  isSuccess = false;

  ngOnInit() {
    const userId = this._authService.getCurrentUserId();
    if (userId) {
      this.loadUserData(userId);
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

  updateProfile() {
    this.isLoading = true;
    this.message = '';

    const dataToUpdate = {
        name: this.user.name,
        lastname: this.user.lastname,
        phoneNumber: this.user.phoneNumber,
        email: this.user.email 
    };

    this._usersService.update(this.user.id).subscribe({
      next: (res) => {
        this.message = '¡Datos actualizados correctamente!';
        this.isSuccess = true;
        this.isLoading = false;
        
        // Ocultar mensaje a los 3 seg
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
}