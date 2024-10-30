import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { isArray } from 'node:util';
import { GaragesService } from '../../services/garages.service.js';
import { LocationsService } from '../../services/locations.service.js';

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './garages.component.html',
  styleUrl: './garages.component.css'
})
export class GaragesComponent {
  currentSection: string = 'initial';
  garageList: any[] = [];
  private _apiservice = inject(GaragesService);
  private _locationService = inject(LocationsService);
  garageCreado = false;;
  garageCuit: any = '';
  aGarage: any = null;
  editingGarage: any = null;

  garageData = {

    cuit: '',
    name: '',
    password: '',
    address: '',
    phoneNumber: '',
    email: '',
    location: '',

  }

  ngOnInit() {
    this.loadLocations(); // Cargar las localidades al iniciar
  }



  modificarGarage(garage: any) {

    this.currentSection = 'editGarage';
    this.editingGarage = { ...garage };

  }




  createGarage(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this._apiservice.createGarage(this.garageData).subscribe({
      next: (response) => {
        console.log('Garage creado exitosamente:', response);
        this.garageCreado = true;
        this.showSection('initial');
        form.resetForm();

        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.garageCreado = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
      }
    });




    this._apiservice.createGarage(this.garageData).subscribe({
      next: (response) => {
        console.log('Cochera creada exitosamente:', response);
      },
      error: (error) => {
        console.error('Error al crear la chochera:', error);
      }
    });
  }




  getGarage() {
    this._apiservice.getGarage(this.garageCuit).subscribe(
      (garage: any) => {
        this.currentSection = "geTaGarageTable"
        console.log(garage)
        this.aGarage = garage
        this.garageCuit = ''
      },
      (error) => {
        console.error('Error al obtener un Garage', error);
        alert('El garage no existe o ocurrió un error al obtener la información.');
      }
    );
  }

  getGarages() {
    this._apiservice.getGarages().subscribe((data: any[]) => {

      if (Array.isArray(data)) {
        this.garageList = data

      } else {

        this.garageList = [data]
      }


      console.log(data)
    })
  }

  deleteGarage(garageCuit: string, tipo: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar esta cochera?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.deleteGarage(garageCuit).subscribe({
      next: (response) => {
        console.log('Cochera eliminada exitosamente', response);
        this.getGarages(); // Refresca la lista de cocheras
      },
      error: (error) => {
        console.error('Error al eliminar la cochera', error);
      }
    });

    if (tipo = true) { this.currentSection = 'initial' }
  }



  updateGarage() {
    const confirmation = confirm('¿Está seguro de que desea modificar esta cochera?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateGarage(this.editingGarage).subscribe({
      next: (response) => {
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

    if (section == 'getGarage') {

      this.getGarages()

    }

  }

  locations: Array<any> = []; // Array para almacenar las localidades



  loadLocations() {
    this._locationService.getLocations().subscribe(data => {
      this.locations = data;
    });
  }


}