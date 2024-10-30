import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiclesService } from '../../services/vehicles.service.js';
import { runInThisContext } from 'vm';
import { FormsModule, NgForm } from '@angular/forms';
import { TypeVehicleService } from '../../services/type-vehicle.service.js';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent {

  vehiculoCreado = false;
  private _apiservice = inject(VehiclesService)
  private _typeVehicleService = inject(TypeVehicleService)
  vehiclesList: any[] = []
  typeVehicles: Array<any> = [];
  licensePlate: string = ''
  aVehicle: any = null
  editingVehicle: any = null

  vehicleData = {

    license_plate: "",
    owner: "",
    type: ""

  }

  ngOnInit() {
    this.loadTypeVehicles(); // Cargar los tipos al iniciar
  }



  getAvehicle(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Detiene el envío si el formulario no es válido
    }

    console.log('getAvehicle');

    this._apiservice.getVehicle(this.licensePlate).subscribe(
      (vehicle: any) => {
        this.currentSection = "geTaVehicleTable"
        console.log(vehicle)
        this.aVehicle = vehicle
        this.licensePlate = ''
      },
      (error) => {
        console.error('Error al obtener un Vehiculo', error);
        alert('El Vehiculo no existe o ocurrió un error al obtener la información.');
      }
    );
  }


  getVehicles() {

    this._apiservice.getVehicles().subscribe((data: any[]) => {


      if (Array.isArray(data)) {
        this.vehiclesList = data

      } else {

        this.vehiclesList = [data]
      }

      console.log(data)

    })


  }


  changeVehicle(vehicle: any) {

    this.currentSection = 'editVehicle';
    this.editingVehicle = { ...vehicle };

  }

  updateUser() {
    const confirmation = confirm('¿Está seguro de que desea modificar este vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateVehicle(this.editingVehicle).subscribe({
      next: (response) => {
        console.log('Vehiculo actualizado exitosamente', response);
        this.editingVehicle = null; // Limpia la variable de edición
        this.getVehicles(); // Refresca la lista de vehiculos
      },
      error: (error) => {
        console.error('Error al actualizar el Vehiculo', error);
      }
    });
  }

  deleteVehicle(license_plate: string, type: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.deleteVehicle(license_plate).subscribe({
      next: (response) => {
        console.log('Vehiculo eliminado exitosamente', response);
        this.getVehicles(); // Refrescar la lista de usuarios
      },
      error: (error) => {
        console.error('Error al eliminar el vehiculo', error);
      }
    });


    if (type == true) { this.currentSection = 'initVehicles' }
  }

  createVehicle(form: NgForm) {

    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this._apiservice.createVehicle(this.vehicleData).subscribe({
      next: (response) => {
        console.log('Vehiculo creado exitosamente:', response);
        this.vehiculoCreado = true;
        this.showSection('initVehicles');
        form.resetForm();

        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.vehiculoCreado = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al crear vehiculo:', error);
      }
    });
  }

  currentSection: String = 'initVehicles'

  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getVehicles') {

      this.getVehicles()

    }

  }


  loadTypeVehicles() {
    // Simular llamada a un servicio para obtener las localidades
    this._typeVehicleService.getTypeVehicles().subscribe(data => {
      this.typeVehicles = data;
    });
  }





}