import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LocationsService } from '../../services/locations.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.css'
})
export class LocationsComponent {

  localidadCreada = false;
  currentSection: string = 'initial'
  locationList: any[] = []
  garages: any[] = []
  private _apiservice = inject(LocationsService)
  private _notificationService = inject(NotificationService);
  locationID: string = ''
  aLocation: any = null
  editingLocation: any = null;

  locationData = {

    name: '',
    province: '',
    garages: ['']

  }


  modificarLocation(location: any) {

    this.currentSection = 'editLocation';
    this.editingLocation = { ...location };

  }


  getLocation(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Detiene el envío si el formulario no es válido
    }



    this._apiservice.getLocation(this.locationID).subscribe(
      (location: any) => {
        this.currentSection = "geTaLocationTable"
        this.aLocation = location
        this.locationID = ''
      },
      (error) => {
        this._notificationService.warning('La localidad no existe o ocurrió un error.');
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
        this.localidadCreada = true;
        this.showSection('initial');
        form.resetForm();

        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.localidadCreada = false;
        }, 3000);
      },
      error: (error) => {
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


    })
  }

  deleteLocation(locationId: string, tipo: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar esta localidad?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.deleteLocation(locationId).subscribe({
      next: (response) => {
        this.getLocations(); // Refresca la lista de localidades
      },
      error: (error) => {
      }
    });

    if (tipo) { this.currentSection = 'initial' }

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
      return; // Si el usuario cancela, no hacemos nada
    }


    this._apiservice.updateLocation(this.editingLocation).subscribe({
      next: (response) => {
        this.editingLocation = null; // Limpia la variable de edición
        this.getLocations(); // Refresca la lista de localidades
        this.showSection('initial');
        form.resetForm();
      },
      error: (error) => {
      }
    });
  }

  // Método para actualizar la sección actual mostrada
  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getLocation') {

      this.getLocations()

    }

  }

  // Lista de provincias de Argentina
  provincias: string[] = [
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