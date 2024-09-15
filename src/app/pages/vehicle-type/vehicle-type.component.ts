import { Component, inject } from '@angular/core';
import { TypeVehicleService } from '../../services/type-vehicle.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-type.component.html',
  styleUrl: './vehicle-type.component.css'
})
export class VehicleTypeComponent {


  private _apiservice = inject(TypeVehicleService)

  typeVehiclesList: any[] = []

  idType: string =''

  aTypeVehicle: any = null

  getATypevehicle(){
    this._apiservice.getTypeVehicle((this.idType)).subscribe((typeVehicle: any)=>{

      console.log(typeVehicle)
      this.aTypeVehicle = typeVehicle
      this.idType =''
    }
    )}
  

  getTypeVehicles(){

    this._apiservice.getTypeVehicles().subscribe((data: any[]) =>{


      if(Array.isArray(data)){
        this.typeVehiclesList = data 
  
      } else{
  
        this.typeVehiclesList = [data]
      }

      console.log(data)

    })


  }

  typeVehicleData = {

    id: '',
    name:'',

  }

  editingTypeVehicle: any = null

  modificarTipoVehiculo(typeVehicle:any){

    this.currentSection = 'editTypeVehicle';
    this.editingTypeVehicle = { ...typeVehicle };
 
   }
 
  updateTypeVehicle() {
    const confirmation = confirm('¿Está seguro de que desea modificar este tipo de Vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateTypeVehicle(this.editingTypeVehicle).subscribe({
      next: (response) =>{
      console.log('Tipo de Vehiculo actualizado exitosamente', response);
      this.editingTypeVehicle = null; // Limpia la variable de edición
      },
    error: (error) => {
      console.error('Error al actualizar el usuario', error);
    }
  });
  }

  deleteTypeVehicle(license_plate: string, type:boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }
  
    this._apiservice.deleteTypeVehicle(license_plate).subscribe({
      next: (response) => {
        console.log('Vehiculo eliminado exitosamente', response);
        this.getTypeVehicles(); // Refrescar la lista de usuarios
      },
      error: (error) => {
        console.error('Error al eliminar el vehiculo', error);
      }
    });


    if(type == true){this.currentSection = 'initial'}
  }



  createVehicle() {
    this._apiservice.createTypeVehicle(this.typeVehicleData).subscribe({
      next: (response) => {
        console.log('Tipo de Vehiculo creado exitosamente:', response);
      },
      error: (error) => {
        console.error('Error al crear tipo de vehiculo:', error);
      }
    });
  }



  currentSection: String = 'initial'

  showSection(section: string) {
    this.currentSection = section;

    if(section == 'getTypeVehicles'){

      this.getTypeVehicles()

    }

  }


}



