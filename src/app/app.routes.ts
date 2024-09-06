import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UsersComponent } from './pages/users/users.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component.js';
import { LoginComponent } from './pages/login/login.component.js';

export const routes: Routes = [

    {path: '', component: HomeComponent},
    {path: 'users', component: UsersComponent},
    {path: 'vehicles', component: VehiclesComponent},
    { path: 'login', component: LoginComponent },
    {path: '**', redirectTo: '', pathMatch: 'full'}

];
