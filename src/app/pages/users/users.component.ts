import { Component, inject, OnInit } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isArray } from 'node:util';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  mostrar: Boolean = false
  mostrar2: Boolean = false
  mostrar3: Boolean = true

  transformarMostrar3(){

    this.mostrar3 = !this.mostrar3

  }

  userData = {

    name: '',
    lastname: '',
    dni: '', 
    address: '',
    email:'',
    phone_number: '',
    vehicles: ''

  }


  transformarMostrar(){

    this.mostrar = !this.mostrar
    this.mostrar3 = !this.mostrar3
    this.getUsers()
  }

  transformarMostrar2(){

    this.mostrar2 = !this.mostrar2
    this.mostrar3 = !this.mostrar3
  }


  currentSection: string = 'get'; // Inicializa en la sección de "get"

  userList: any[] = []

  vehicless : any[] = []

 private _apiservice = inject(ApiServiceService)


 onSubmit() {
  this._apiservice.createUser(this.userData).subscribe({
    next: (response) => {
      console.log('Usuario creado exitosamente:', response);
    },
    error: (error) => {
      console.error('Error al crear usuario:', error);
    }
  });
}

 getUsers(){
  this._apiservice.getUsers().subscribe((data: any[])=>{

    if(Array.isArray(data)){
      this.userList = data 

    } else{

      this.userList = [data]
    }

    
    console.log(data)
  })
 }

 deleteUser(userId: string) {
  this._apiservice.delete(userId).subscribe(response => {
    console.log('Usuario eliminado exitosamente', response);
    // Actualiza la lista de usuarios después de la eliminación
    this.getUsers(); // Llama a este método para refrescar la lista de usuarios
  }, error => {
    console.error('Error al eliminar el usuario', error);
  });

 }

  editingUser: any = null;

  editUser(user: any) {
    this.editingUser = { ...user }; // Copia del usuario para editar
  }
  
  updateUser() {
    this._apiservice.update(this.editingUser).subscribe(response => {
      console.log('Usuario actualizado exitosamente', response);
      this.editingUser = null; // Limpia la variable de edición
      this.getUsers(); // Refresca la lista de usuarios
    }, error => {
      console.error('Error al actualizar el usuario', error);
    });
  }

    // Método para actualizar la sección actual mostrada
    showSection(section: string) {
      this.currentSection = section;
    }

}

