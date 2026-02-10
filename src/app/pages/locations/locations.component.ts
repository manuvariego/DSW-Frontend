import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LocationsService } from '../../services/locations.service.js';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.css'
})
export class LocationsComponent {

  locationCreated = false;
  currentSection: string = 'initial'
  locationList: any[] = []
  private _apiservice = inject(LocationsService)
  locationID: string = ''
  aLocation: any = null
  editingLocation: any = null;

  locationData = {

    name: '',
    province: '',
    garages: ['']

  }


  modifyLocation(location: any) {

    this.currentSection = 'editLocation';
    console.log(location);
    this.editingLocation = { ...location };

  }


  getLocation(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    console.log('getLocation');


    this._apiservice.getLocation(this.locationID).subscribe(
      (location: any) => {
        this.currentSection = "geTaLocationTable"
        console.log(location)
        this.aLocation = location
        this.locationID = ''
      },
      (error) => {
        console.error('Error al obtener un Location', error);
        alert('La Localidad no existe o ocurrió un error al obtener la información.');
      }
    );

  }


  createLocation(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this._apiservice.createLocation(this.locationData).subscribe({
      next: (response) => {
        console.log('Localidad dada de alta exitosamente:', response);
        this.locationCreated = true;
        this.showSection('initial');
        form.resetForm();

        setTimeout(() => {
          this.locationCreated = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al crear la localidad:', error);
      }
    });
  }

  getLocations() {
    this._apiservice.getLocations().subscribe((data: any[]) => {

      if (Array.isArray(data)) {
        this.locationList = data

      } else {

        this.locationList = [data]
      }


      console.log(data)
    })
  }

  deleteLocation(locationId: string, type: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar esta localidad?');
    if (!confirmation) {
      return;
    }

    this._apiservice.deleteLocation(locationId).subscribe({
      next: (response) => {
        console.log('Localidad eliminada exitosamente', response);
        this.getLocations();
      },
      error: (error) => {
        console.error('Error al eliminar la localidad', error);
      }
    });

    if (type) { this.currentSection = 'initial' }

  }

  updateLocation(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    const confirmation = confirm('¿Está seguro de que desea modificar esta localidad?');
    if (!confirmation) {
      return;
    }


    this._apiservice.updateLocation(this.editingLocation).subscribe({
      next: (response) => {
        console.log('Localidad actualizada exitosamente', response);
        this.editingLocation = null;
        this.getLocations();
        this.showSection('initial');
        form.resetForm();
      },
      error: (error) => {
        console.error('Error al actualizar la localidad', error);
      }
    });
  }

  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getLocation') {

      this.getLocations()

    }

  }

  provinces: string[] = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];


}