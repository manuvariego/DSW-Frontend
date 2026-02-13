import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { GaragesComponent } from './pages/garages/garages.component';
import { ReservationTypesComponent } from './pages/reservationTypes/reservationTypes.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ParkingSpaceComponent } from './pages/parking-space/parking-space.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { ServiceComponent } from './pages/services/services.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { garageGuard } from './guards/garage.guard';
import { userGuard } from './guards/user.guard';

export const routes: Routes = [
    // Publicas
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Requieren estar logueado (ambos roles)
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

    // Solo usuarios
    { path: 'vehicles', component: VehiclesComponent, canActivate: [authGuard, userGuard] },
    { path: 'reservation', component: ReservationComponent, canActivate: [authGuard, userGuard] },

    // Solo garages
    { path: 'garages', component: GaragesComponent, canActivate: [authGuard, garageGuard] },
    { path: 'parkingSpace', component: ParkingSpaceComponent, canActivate: [authGuard, garageGuard] },
    { path: 'reservationTypes', component: ReservationTypesComponent, canActivate: [authGuard, garageGuard] },
    { path: 'services', component: ServiceComponent, canActivate: [authGuard, garageGuard] },

    { path: '**', redirectTo: '', pathMatch: 'full' }

];
