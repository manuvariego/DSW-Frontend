import { Component, inject, OnInit } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service.js';
import { CommonModule } from '@angular/common';
import { isArray } from 'node:util';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit{

  mostrar: Boolean = false
  mostrar2: Boolean = false
  mostrar3: Boolean = true

  transformarMostrar3(){

    this.mostrar3 = !this.mostrar3

  }


  transformarMostrar(){

    this.mostrar = !this.mostrar
    this.mostrar3 = !this.mostrar3

  }

  transformarMostrar2(){

    this.mostrar2 = !this.mostrar2
    this.mostrar3 = !this.mostrar3
  }

  userList: any[] = []

  vehicless : any[] = []

 private _apiservice = inject(ApiServiceService)

 ngOnInit(): void {
  this._apiservice.getUsers().subscribe((data: any[])=>{

    if(Array.isArray(data)){
      this.userList = data 

    } else{

      this.userList = [data]
    }

    console.log(data)
  })
 }

 }


