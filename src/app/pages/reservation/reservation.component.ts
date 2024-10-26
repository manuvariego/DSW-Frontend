import { Component, OnInit , inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service.js';
import { UsersService } from '../../services/users.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';



@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})
export class ReservationComponent implements OnInit {
  
  reservationForm!: FormGroup;

  reservationData = {

    check_in_at: '' ,
    check_out_at: '', 
    license_plate: '',
    cuitGarage: '',

  }

  filters = {
    check_in_at: '' ,
    check_out_at: '', 
    license_plate: '',

  }

  constructor(private fb: FormBuilder, private reservationService: ReservationService) { }

  private _apiservice = inject(UsersService)
  private _apiserviceGarage = inject(GaragesService)
  userID:string= '13'

  ngOnInit() {

  this.getVehicles()

  }

  getVehicles() { 
  
    this._apiservice.getUser((this.userID)).subscribe((user: any)=>{
  
      console.log(user) 

      this.userVehicles = user.vehicles
    })
  

}

Garages: any[] = []

getGaragesAvailables(){

  this.reservationService.getGaragesAvailables(this.filters).subscribe((data: any[])=>{

    if(Array.isArray(data)){
      this.Garages = data 

    } else{

      this.Garages = [data]
    }

    
    console.log(data)
  })



}

saveGarage(aGarage:any){
this.reservationData.cuitGarage = aGarage.cuit

this.createReservation()

this.currentSection = 'realizada'


}

theReservation: any = null

createReservation() {
  this.reservationService.createReservation(this.reservationData).subscribe({
    next: (response) => {
      console.log('Tipo de reserva creado exitosamente:', response);
      this.theReservation = response
    },
    error: (error) => {
      console.error('Error al crear el tipo de reserva:', error);
    }
  });
}



userVehicles: any[] = []
/*
  onSubmit() {
      this.reservationService.createReservation(this.reservationData).subscribe({
        next: (res) => {
          console.log('Reserva creada!', res);
        },
        error: (err) => {
          console.error('Error creando reserva', err);
        }
      });
  }
  */

  currentSection : any = 'initial'

  showSection(section: string) {
    this.currentSection = section;


    if (this.currentSection == 'garages'){
      this.getGaragesAvailables()
    }
  }
}
