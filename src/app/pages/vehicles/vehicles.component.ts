import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiclesService } from '../../services/vehicles.service.js';
import { runInThisContext } from 'vm';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent {

  private _apiservice = inject(VehiclesService)

  vehiclesList: any[] = []

  licensePlate: string =''

  aVehicle: any = null


  getAvehicle(){
    this._apiservice.getVehicle(this.licensePlate).subscribe(
      (vehicle: any) => {
        this.currentSection = "geTaVehicleTable"
        console.log(vehicle)
        this.aVehicle = vehicle
        this.licensePlate =''
      },
      (error) => {
        console.error('Error al obtener un Vehicle', error);
        // Aquí podrías mostrar un mensaje de error, por ejemplo usando alert o alguna librería como Toastr
        alert('El Vehiculo no existe o ocurrió un error al obtener la información.');
      }
    );
  }
  

  getVehicles(){

    this._apiservice.getVehicles().subscribe((data: any[]) =>{


      if(Array.isArray(data)){
        this.vehiclesList = data 
  
      } else{
  
        this.vehiclesList = [data]
      }

      console.log(data)

    })


  }

  vehicleData = {

    license_plate: "",
    owner: "",
    type: ""

  }

  editingVehicle: any = null

  modificarVehiculo(vehicle:any){

    this.currentSection = 'editVehicle';
    this.editingVehicle = { ...vehicle };
 
   }
 
  updateUser() {
    const confirmation = confirm('¿Está seguro de que desea modificar este usuario?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateVehicle(this.editingVehicle).subscribe({
      next: (response) =>{
      console.log('Usuario actualizado exitosamente', response);
      this.editingVehicle = null; // Limpia la variable de edición
      this.getVehicles(); // Refresca la lista de usuarios
      },
    error: (error) => {
      console.error('Error al actualizar el usuario', error);
    }
  });
  }

  deleteVehicle(license_plate: string, type:boolean) {
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


    if(type == true){this.currentSection = 'initVehicles'}
  }



  createVehicle() {
    this._apiservice.createVehicle(this.vehicleData).subscribe({
      next: (response) => {
        console.log('Vehiculo creado exitosamente:', response);
      },
      error: (error) => {
        console.error('Error al crear vehiculo:', error);
      }
    });
  }



  currentSection: String = 'initVehicles'

  showSection(section: string) {
    this.currentSection = section;

    if(section == 'getVehicles'){

      this.getVehicles()

    }

  }


}