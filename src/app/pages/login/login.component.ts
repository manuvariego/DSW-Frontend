import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  test() {
    console.log('test');

  }


  username: string = '';
  password: string = '';
  remember: boolean = true;

  onSubmit() {
    // Lógica para manejar el inicio de sesión
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    console.log('Remember me:', this.remember);
    // Aquí puedes añadir la lógica para enviar los datos a tu backend
  }




}