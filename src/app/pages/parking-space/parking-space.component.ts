import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParkingSpaceService } from '../../services/parking-space.service.js';

@Component({
  selector: 'app-parking-space',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-space.component.html',
  styleUrl: './parking-space.component.css'
})
export class ParkingSpaceComponent {

  ParkingSpaceData = {

    number:'',
    garage: '',
    vehicleType: '', 
    

  }


  modificarParkingSpace(ParkingSpace:any){

   this.currentSection = 'editParkingSpace';
   this.editingParkingSpace = { ...ParkingSpace };

  }

  currentSection: string = 'initial'

  ParkingSpaceList: any[] = []

  aParkingSpace: any = null

 private _apiservice = inject(ParkingSpaceService)

  numberParkingSpace: string = ''

 geTaParkingSpace(){
  this._apiservice.getParkingSpace((this.numberParkingSpace)).subscribe((ParkingSpace: any)=>{

    console.log(ParkingSpace)
    this.aParkingSpace = ParkingSpace
    this.numberParkingSpace = ''
  })
}


 createParkingSpace() {
  this._apiservice.createParkingSpace(this.ParkingSpaceData).subscribe({
    next: (response) => {
      console.log('Lugar de Estacionamiento creado exitosamente:', response);
    },
    error: (error) => {
      console.error('Error al crear Lugar de Estacionamiento:', error);
    }
  });
}

 getParkingSpace(){
  this._apiservice.getParkingSpaces().subscribe((data: any[])=>{

    if(Array.isArray(data)){
      this.ParkingSpaceList = data 

    } else{

      this.ParkingSpaceList = [data]
    }

    
    console.log(data)
  })
 }


 deleteParkingSpace(numberParkingSpace: string, tipo: boolean) {
  const confirmation = confirm('¿Está seguro de que desea eliminar este Lugar de Estacionamiento?');
  if (!confirmation) {
    return; // Si el Lugar de Estacionamiento cancela, no hacemos nada
  }

  this._apiservice.deleteParkingSpace(numberParkingSpace).subscribe({
    next: (response) => {
      console.log('Lugar de Estacionamiento eliminado exitosamente', response);
      this.getParkingSpace(); // Refrescar la lista de Lugar de Estacionamientos
    },
    error: (error) => {
      console.error('Error al eliminar el Lugar de Estacionamiento', error);
    }
  });

  if(tipo == true){this.currentSection = 'initial'}

}

  editingParkingSpace: any = null;
  



  updateParkingSpace() {
    const confirmation = confirm('¿Está seguro de que desea modificar este Lugar de Estacionamiento?');
    if (!confirmation) {
      return; // Si el Lugar de Estacionamiento cancela, no hacemos nada
    }

    this._apiservice.updateParkingSpace(this.editingParkingSpace).subscribe({
      next: (response) =>{
      console.log('Lugar de Estacionamiento actualizado exitosamente', response);
      this.editingParkingSpace = null; // Limpia la variable de edición
      },
    error: (error) => {
      console.error('Error al actualizar el Lugar de Estacionamiento', error);
    }
  });
  }

    // Método para actualizar la sección actual mostrada
    showSection(section: string) {
      this.currentSection = section;

      if(section == 'getParkingSpace'){

        this.getParkingSpace()

      }

    }

}
