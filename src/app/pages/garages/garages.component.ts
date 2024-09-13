import { Component, inject, OnInit } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isArray } from 'node:util';
import { GaragesService } from '../../services/garages.service.js';

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './garages.component.html',
  styleUrl: './garages.component.css'
})
export class GaragesComponent {

 /* mostrar: Boolean = false
  mostrar2: Boolean = false
  mostrar3: Boolean = true
  modificarUsu: Boolean = false


  transformarMostrar3(){

    this.mostrar3 = !this.mostrar3

  }*/

  garageData = {

    cuit: '',
    name: '',
    address: '',
    phone_number: '',
    email:'',

  }


  modificarGarage(garage:any){

   this.currentSection = 'editGarage';
   this.editingGarage = { ...garage };

  }

  currentSection: string = 'initial'

  garageList: any[] = []

// falta especificar que localidad tiene el garage

 private _apiservice = inject(GaragesService)


 createGarage() {
  this._apiservice.createGarage(this.garageData).subscribe({
    next: (response) => {
      console.log('Cochera creada exitosamente:', response);
    },
    error: (error) => {
      console.error('Error al crear la chochera:', error);
    }
  });
}

 getGarages(){
  this._apiservice.getGarages().subscribe((data: any[])=>{

    if(Array.isArray(data)){
      this.garageList = data 

    } else{

      this.garageList = [data]
    }

    
    console.log(data)
  })
 }

 deleteGarage(garageCuit: string) {
  const confirmation = confirm('¿Está seguro de que desea eliminar esta cochera?');
  if (!confirmation) {
    return; // Si el usuario cancela, no hacemos nada
  }

  this._apiservice.deleteGarage(garageCuit).subscribe({
    next: (response) => {
      console.log('Cochera eliminada exitosamente', response);
      this.getGarages(); // Refrescar la lista de usuarios
    },
    error: (error) => {
      console.error('Error al eliminar la cochera', error);
    }
  });
}

  editingGarage: any = null;
  
  updateGarage() {
    const confirmation = confirm('¿Está seguro de que desea modificar esta cochera?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateGarage(this.editingGarage).subscribe({
      next: (response) =>{
      console.log('Cochera actualizada exitosamente', response);
      this.editingGarage = null; // Limpia la variable de edición
      this.getGarages(); // Refresca la lista de usuarios
      },
    error: (error) => {
      console.error('Error al actualizar la cochera', error);
    }
  });
  }

    // Método para actualizar la sección actual mostrada
    showSection(section: string) {
      this.currentSection = section;

      if(section == 'getGarage'){

        this.getGarages()

      }

    }

}