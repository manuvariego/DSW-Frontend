import { Component, inject, OnInit } from '@angular/core';
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

  garageData = {

    cuit: '',
    name: '',
    address: '',
    phone_number: '',
    email:'',
    priceHour: '',
    location: '',

  }

  garageCuit: any = ''

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

aGarage: any = null

getGarage(){
  this._apiservice.getGarage((this.garageCuit)).subscribe((garage: any)=>{

    console.log(garage)
    this.aGarage = garage
    this.garageCuit = ''
  })
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

 deleteGarage(garageCuit: string , tipo: boolean) {
  const confirmation = confirm('¿Está seguro de que desea eliminar esta cochera?');
  if (!confirmation) {
    return; // Si el usuario cancela, no hacemos nada
  }

  this._apiservice.deleteGarage(garageCuit).subscribe({
    next: (response) => {
      console.log('Cochera eliminada exitosamente', response);
      this.getGarages(); // Refrescar la lista de cocheras
    },
    error: (error) => {
      console.error('Error al eliminar la cochera', error);
    }
  });
  
  if(tipo = true){this.currentSection = 'initial'}
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