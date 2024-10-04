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

    date_time_reservation: new Date().toISOString() ,
    check_in_at: '' ,
    check_out_at: '', 
    estado: '', 
    amount: 0,
    vehicle: '',
    garage: '',
    parkingSpace: '' 
  }

  constructor(private fb: FormBuilder, private reservationService: ReservationService) { }

  private _apiservice = inject(UsersService)
  private _apiserviceGarage = inject(GaragesService)
  userID:string= '4'

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

getGarages(){

  this._apiserviceGarage.getGarages().subscribe((data: any[])=>{

    if(Array.isArray(data)){
      this.Garages = data 

    } else{

      this.Garages = [data]
    }

    
    console.log(data)
  })



}


userVehicles: any[] = []

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

  currentSection : any = 'initial'

  showSection(section: string) {
    this.currentSection = section;


    if (this.currentSection == 'garages'){
      this.getGarages()
    }
  }
}
