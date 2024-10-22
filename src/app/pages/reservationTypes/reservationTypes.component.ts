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

  desc: string =''
  Cuit: string = ''
  aReservationType: any = null

  reservationType: any = null 

    getReservationType(){
      this._apiservice.getReservationType(this.desc, this.Cuit).subscribe(
        (reservationType: any) => {
          this.currentSection = "geTaReservationTypeTable"
          console.log(reservationType)
          this.aReservationType = reservationType
          this.desc = ''
          this.Cuit = ''
        },
        (error) => {
          console.error('Error al obtener un tipo de Reserva', error);
          // Aquí podrías mostrar un mensaje de error, por ejemplo usando alert o alguna librería como Toastr
          alert('El tipo de Reserva no existe o ocurrió un error al obtener la información.');
        }
      );
  }

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
    price: "",
    garage: ""

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
      this.getReservationTypes(); // Refresca la lista de usuarios
      },
    error: (error) => {
      console.error('Error al actualizar el tipo de reserva', error);
    }
  });
  }

  deleteReservationType(desc: string, cuit:string,  type:boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este tipo de reserva?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }
  
    this._apiservice.deleteReservationType(desc, cuit).subscribe({
      next: (response) => {
        console.log(' Tipo de reserva eliminado exitosamente', response);
        this.getReservationTypes(); // Refrescar la lista
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

    if(section == 'getReservationTypes'){

      this.getReservationTypes()

    }

  }


}