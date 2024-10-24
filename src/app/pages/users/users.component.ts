import { Component, inject, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service.js';
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


  userData = {

    dni: '', 
    name: '',
    lastname: '',
    password: '',
    address: '',
    email:'',
    phone_number: '',
    vehicles: ['']

  }


  modificarUsuario(user:any){

   this.currentSection = 'editUser';
   this.editingUser = { ...user };

  }

  currentSection: string = 'initial'

  userList: any[] = []

  aUser: any = null

  vehicless : any[] = []

 private _apiservice = inject(UsersService)

  userID: string = ''

  geTaUser() {
    this._apiservice.getUser(this.userID).subscribe(
      (user: any) => {
        this.currentSection = 'geTaUserTable';
        console.log(user);
        this.aUser = user;
        this.userID = '';
      },
      (error) => {
        console.error('Error al obtener el usuario', error);
        // Aquí podrías mostrar un mensaje de error, por ejemplo usando alert o alguna librería como Toastr
        alert('El usuario no existe o ocurrió un error al obtener la información.');
      }
    );
  }


 createUserr() {
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


 deleteUser(userId: string, tipo: boolean) {
  const confirmation = confirm('¿Está seguro de que desea eliminar este usuario?');
  if (!confirmation) {
    return; // Si el usuario cancela, no hacemos nada
  }

  this._apiservice.delete(userId).subscribe({
    next: (response) => {
      console.log('Usuario eliminado exitosamente', response);
      this.getUsers(); // Refrescar la lista de usuarios
    },
    error: (error) => {
      console.error('Error al eliminar el usuario', error);
    }
  });

  if(tipo == true){this.currentSection = 'initial'}

}

  editingUser: any = null;
  



  updateUser() {
    const confirmation = confirm('¿Está seguro de que desea modificar este usuario?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.update(this.editingUser).subscribe({
      next: (response) =>{
      console.log('Usuario actualizado exitosamente', response);
      this.editingUser = null; // Limpia la variable de edición
      this.getUsers(); // Refresca la lista de usuarios
      },
    error: (error) => {
      console.error('Error al actualizar el usuario', error);
    }
  });
  }

    // Método para actualizar la sección actual mostrada
    showSection(section: string) {
      this.currentSection = section;

      if(section == 'getUser'){

        this.getUsers()

      }

    }

}

