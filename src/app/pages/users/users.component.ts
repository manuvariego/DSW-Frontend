import { Component, inject, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { isArray } from 'node:util';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  usuarioCreado = false;
  currentSection: string = 'initial';
  userList: any[] = [];
  aUser: any = null;
  vehicless : any[] = [];
  private _apiservice = inject(UsersService);
  userID: string = '';
  editingUser: any = null;

  userData = {
    dni: '', 
    name: '',
    lastname: '',
    password: '',
    address: '',
    email:'',
    phoneNumber: '',
    vehicles: ['']
  }

  changeUser(user:any){
   console.log('changeUser');
   this.currentSection = 'editUser';
   this.editingUser = { ...user };

  }

  getOneUser(form: NgForm) {
  if (form.invalid) {
    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return; // Detiene el envío si el formulario no es válido
  }

  console.log('getOneUser');

  this._apiservice.getUser(this.userID).subscribe(
    (user: any) => {
      this.currentSection = 'getUserTable';
      console.log(user);
      this.aUser = user;
      this.userID = '';
    },
    (error) => {
      console.error('Error al obtener el usuario', error);
      alert('Usuario no encontrado.');
    }
  );
  }

 createUser(form: NgForm) {
  if (form.invalid) {
    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
    return;
  }

  this._apiservice.createUser(this.userData).subscribe({
    next: (response) => {
      console.log('Usuario creado exitosamente:', response);
      this.usuarioCreado = true;
      this.showSection('initial');
      form.resetForm();

    // Oculta el mensaje después de 3 segundos
    setTimeout(() => {
      this.usuarioCreado = false;
    }, 3000); 
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

  if(tipo == true){console.log('deleteUser'); this.currentSection = 'initial'}

}
  
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
      console.log('showSection',section);
      this.currentSection = section;

      if(section == 'getUsers'){

        this.getUsers()

      }

    }

}

