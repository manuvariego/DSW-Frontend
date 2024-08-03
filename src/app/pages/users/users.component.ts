import { Component, inject, OnInit } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit{

  mostrar: Boolean = false

  transformarMostrar(){

    this.mostrar = !this.mostrar

  }

  userList: any[] = []

 private _apiservice = inject(ApiServiceService)

 ngOnInit(): void {
  this._apiservice.getUsers().subscribe((data: any[])=>{
    this.userList = data;
    console.log(data)
  })
 }



 }


