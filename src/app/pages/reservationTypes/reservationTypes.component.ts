import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationTypesService } from '../../services/reservationTypes.service.js';
import { runInThisContext } from 'vm'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservationTypes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservationTypes.component.html',
  styleUrl: './reservationTypes.component.css'
})
export class ReservationTypesComponent {

  private _apiservice = inject(ReservationTypesService) 

  reservationTypeList: any[] = [] 

  ResId: string =''

  reservationType: any = null 

  getReservationType(){
    this._apiservice.getReservationType((this.ResId)).subscribe((reservationType: any)=>{

      console.log(reservationType)
      this.reservationType = reservationType
      this.ResId =''
    }
    )}
  

    getReservationTypes(){

    this._apiservice.getReservationTypes().subscribe((data: any[]) =>{


      if(Array.isArray(data)){
        this.reservationTypeList = data 
  
      } else{
  
        this.reservationTypeList = [data]
      }

      console.log(data)

    })


  }

  reservationTypeData = {

    description: "",
    price: ""

  }

  editingReservationType: any = null

  modificarTipodeReserva(reservationType:any){

    this.currentSection = 'editReservationType';
    this.editingReservationType = { ...reservationType };
 
   }
 
  updateReservationType() {
    const confirmation = confirm('¿Está seguro de que desea modificar este tipo de reserva?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateReservationType(this.editingReservationType).subscribe({
      next: (response) =>{
      console.log('Tipo de reserva actualizado exitosamente', response);
      this.editingReservationType = null; // Limpia la variable de edición
      this.getReservationType(); // Refresca la lista de usuarios
      },
    error: (error) => {
      console.error('Error al actualizar el tipo de reserva', error);
    }
  });
  }

  deleteReservationType(ResId: string, type:boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este tipo de reserva?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }
  
    this._apiservice.deleteReservationType(ResId).subscribe({
      next: (response) => {
        console.log(' Tipo de reserva eliminado exitosamente', response);
        this.getReservationType(); // Refrescar la lista
      },
      error: (error) => {
        console.error('Error al eliminar el tipo de reserva', error);
      }
    });


    if(type == true){this.currentSection = 'initReservationType'}
  }



  createReservationType() {
    this._apiservice.createReservationType(this.reservationTypeData).subscribe({
      next: (response) => {
        console.log('Tipo de reserva creado exitosamente:', response);
      },
      error: (error) => {
        console.error('Error al crear el tipo de reserva:', error);
      }
    });
  }



  currentSection: String = 'initReservationType'

  showSection(section: string) {
    this.currentSection = section;

    if(section == 'getReservationType'){

      this.getReservationType()

    }

  }


}