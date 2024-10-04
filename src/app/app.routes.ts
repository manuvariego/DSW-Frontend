import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UsersComponent } from './pages/users/users.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { GaragesComponent } from './pages/garages/garages.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { ReservationTypesComponent } from './pages/reservationTypes/reservationTypes.component';
import { LoginComponent } from './pages/login/login.component';
import { VehicleTypeComponent } from './pages/vehicle-type/vehicle-type.component.js';
import { ParkingSpaceComponent } from './pages/parking-space/parking-space.component.js';
import { ReservationComponent } from './pages/reservation/reservation.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'users', component: UsersComponent },
    { path: 'vehicles', component: VehiclesComponent },
    { path: 'garages', component: GaragesComponent },
    { path: 'locations', component: LocationsComponent },
    { path: 'typeVehicles', component: VehicleTypeComponent },
    { path: 'parkingSpace', component: ParkingSpaceComponent },
    { path: 'reservationTypes', component: ReservationTypesComponent },
    { path: 'reservation', component: ReservationComponent },
    { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

