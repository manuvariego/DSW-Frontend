import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { isArray } from 'node:util';
import { GaragesService } from '../../services/garages.service.js';
import { LocationsService } from '../../services/locations.service.js';
import {ParkingSpaceService} from '../../services/parking-space.service.js';
import { ParkingSpaceComponent } from '../parking-space/parking-space.component.js';
import { TypeVehicleService } from '../../services/type-vehicle.service.js';
import { AuthService } from '../../services/auth.service.js';

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
  private __apiservice = inject(ParkingSpaceService);
  private _locationService = inject(LocationsService);
  private _typeVehicleService = inject(TypeVehicleService);
  private _authService = inject(AuthService);
  garageCreado = false;
  garageCuit: any = '';
  aGarage: any = null;
  editingGarage: any = null;
  editingParkingSpace: any = null;
  typeVehicles: Array<any> = [];

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
    this.loadLocations(); // Carga las localidades al iniciar
    this.loadTypeVehicles();
  }



  modificarGarage(garage: any) {

    this.currentSection = 'editGarage';
    this.editingGarage = { ...garage };

  }

    modificarParkingSpace(parkingSpace: any) {

    this.currentSection = 'editParkingSpace';
    this.editingParkingSpace = { ...parkingSpace };

  }

   updateParkingSpace(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    const confirmation = confirm('¿Está seguro de que desea modificar este Space?');
    if (!confirmation) {
      return; // Si el Lugar de Estacionamiento cancela, no hacemos nada
    }

    this.__apiservice.updateParkingSpace(this.editingParkingSpace).subscribe({
      next: (response) => {
        console.log('Space actualizado exitosamente', response);
        this.editingParkingSpace = null; // Limpia la variable de edición;
        this.getParkingsSpaces(); // Refresca la lista de parkingSpace
        this.showSection('getParkingSpaces');
        form.resetForm();
      },
      error: (error) => {
        console.error('Error al actualizar el Lugar de Estacionamiento', error);
      }
    });
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
  }

  getGarage(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Detiene el envío si el formulario no es válido
    }
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

    ParkingSpaceData = {
    garage: 0,
    number: '',
    TypeVehicle: '',

  }

  parkingCreado = false;

  createParkingSpace(form: NgForm) {
    const cuit = this._authService.getCurrentUserId();
    const numericCuit = cuit ? parseInt(cuit, 10) : 0;

    this.ParkingSpaceData = {
    ...this.ParkingSpaceData,
    garage: numericCuit,
  }

    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.__apiservice.createParkingSpace(this.ParkingSpaceData).subscribe({
      next: (response) => {
        console.log('Lugar de Estacionamiento creado exitosamente:', response);
        this.parkingCreado = true;
        this.showSection('initial');
        form.resetForm();
        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.parkingCreado = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al crear Lugar de Estacionamiento:', error);
      }
    });
  }

  getParkingsSpaces() {
    const cuit = this._authService.getCurrentUserId();

    console.log(cuit);

    if (!cuit) return;
    this.garageCuit = cuit;

    this.__apiservice.getParkingSpaceOfGarage(cuit).subscribe((data: any[]) => {

      if (Array.isArray(data)) {
        this.garageList = data

      } else {

        this.garageList = [data]
      }


      console.log(data)
    })
  }

  getTypeVehicleName(id: any): string {
    const type = this.typeVehicles.find(t => t.id == id);
    return type ? type.name : 'Desconocido';
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

  deleteParkingSpace(numberParkingSpace: string, tipo: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este Lugar de Estacionamiento?');
    if (!confirmation) {
      return;
    }

    this.__apiservice.deleteParkingSpace(numberParkingSpace, this.garageCuit).subscribe({
      next: (response) => {
        console.log('Lugar de Estacionamiento eliminado exitosamente', response);
        this.getParkingsSpaces();
      },
      error: (error) => {
        console.error('Error al eliminar el Lugar de Estacionamiento', error);
      }
    });

    if (tipo) { this.currentSection = 'initial'; }
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

    if (tipo) { this.currentSection = 'initial' }
  }



  updateGarage(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    const confirmation = confirm('¿Está seguro de que desea modificar esta cochera?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateGarage(this.editingGarage).subscribe({
      next: (response) => {
        console.log('Cochera actualizada exitosamente', response);
        this.editingGarage = null; // Limpia la variable de edición
        this.getGarages(); // Refresca la lista de garages
        this.showSection('initial');
        form.resetForm();
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

    if (section == 'getParkingSpaces') { 

      this.getParkingsSpaces() 
    }           

  }

  locations: Array<any> = []; // Array para almacenar las localidades



  loadLocations() {
    this._locationService.getLocations().subscribe(data => {
      this.locations = data;
    });
  }

  loadTypeVehicles() {
    this._typeVehicleService.getTypeVehicles().subscribe(data => {
      this.typeVehicles = data;
    });
  }


}