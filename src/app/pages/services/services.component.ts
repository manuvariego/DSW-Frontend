import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../services/service.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
selector: 'app-service',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './services.component.html',
styleUrls: ['./services.component.css']
})
export class ServiceComponent implements OnInit {

availableServices: any[] = []; // La lista completa del sistema
selectedServicesIds: number[] = []; // Los IDs de los servicios que ofrece la cochera
garageCuit: any = '';

ngOnInit(): void {
    const cuit = localStorage.getItem('cuitGarage');
    this.garageCuit = cuit ? Number(cuit) : 11;
    this.loadData();
}

isLoading = true;
message = '';

constructor(private serviceService: ServiceService) { }


loadData() {
    this.isLoading = true;

this.serviceService.getAllServices().subscribe({
next: (services) => {
    this.availableServices = services;
        
    this.serviceService.getGarageByCuit(this.garageCuit).subscribe({
        next: (garage) => {
        
        const servicios = garage.services || []; 
        this.selectedServicesIds = servicios.map((s: any) => s.id);
        this.isLoading = false;
        },
        error: (err) => console.error('Error cargando cochera', err)
    });
    },
    error: (err) => console.error('Error cargando servicios', err)
});
}


onCheckboxChange(e: any, serviceId: number) {
if (e.target.checked) {
      // Si se marcó, lo agrego al array
    this.selectedServicesIds.push(serviceId);
    } else {
      // Si se desmarcó, lo filtro (lo saco del array)
    this.selectedServicesIds = this.selectedServicesIds.filter(id => id !== serviceId);
    }
    console.log("Seleccionados:", this.selectedServicesIds);
}

saveChanges() {
this.serviceService.updateGarageServices(this.garageCuit, this.selectedServicesIds)
    .subscribe({
    next: (response) => {
        this.message = '¡Servicios actualizados correctamente!';
        setTimeout(() => this.message = '', 3000);
    },
    error: (err) => {
        this.message = 'Error al guardar cambios.';
        console.error(err);
    }
    });
}
}