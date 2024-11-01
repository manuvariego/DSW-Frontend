import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ParkingSpaceService } from '../../services/parking-space.service.js';
import { TypeVehicleService } from '../../services/type-vehicle.service.js';

@Component({
  selector: 'app-parking-space',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-space.component.html',
  styleUrl: './parking-space.component.css'
})
export class ParkingSpaceComponent {

  parkingCreado = false;
  currentSection: string = 'initial'
  typeVehicles: Array<any> = [];
  ParkingSpaceList: any[] = []
  aParkingSpace: any = null
  private _apiservice = inject(ParkingSpaceService)
  private _typeVehicleService = inject(TypeVehicleService)
  numberParkingSpace: string = ''
  cuitGarage: string = ''

  ParkingSpaceData = {

    number: '',
    garage: '',
    TypeVehicle: '',

  }

  ngOnInit() {
    this.loadTypeVehicles(); // Cargar los tipos al iniciar
  }




  modificarParkingSpace(ParkingSpace: any) {

    this.currentSection = 'editParkingSpace';
    this.editingParkingSpace = { ...ParkingSpace };

  }


  geTaParkingSpace(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Detiene el envío si el formulario no es válido
    }

    console.log('geTaParkingSpace');
    this._apiservice.getParkingSpace(this.numberParkingSpace, this.cuitGarage).subscribe(
      (ParkingSpace: any) => {
        this.currentSection = "geTaParkingSpaceTable"
        console.log(ParkingSpace)
        this.aParkingSpace = ParkingSpace
        this.numberParkingSpace = ''
      },
      (error) => {
        console.error('Error al obtener un ParkingSpace', error);
        alert('El ParkingSpace no existe o ocurrió un error al obtener la información.');
      }
    );
  }


  createParkingSpace(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this._apiservice.createParkingSpace(this.ParkingSpaceData).subscribe({
      next: (response) => {
        console.log('Lugar de Estacionamiento creado exitosamente:', response);
        this.parkingCreado = true;
        this.showSection('initial');
        form.resetForm();
        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.parkingCreado = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al crear Lugar de Estacionamiento:', error);
      }
    });
  }

  getParkingSpace() {
    this._apiservice.getParkingSpaces().subscribe((data: any[]) => {

      if (Array.isArray(data)) {
        this.ParkingSpaceList = data

      } else {

        this.ParkingSpaceList = [data]
      }


      console.log(data)
    })
  }


  deleteParkingSpace(numberParkingSpace: string, cuitGarage: String, tipo: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este Lugar de Estacionamiento?');
    if (!confirmation) {
      return; // Si el Lugar de Estacionamiento cancela, no hacemos nada
    }

    this._apiservice.deleteParkingSpace(numberParkingSpace, cuitGarage).subscribe({
      next: (response) => {
        console.log('Lugar de Estacionamiento eliminado exitosamente', response);
        this.getParkingSpace(); // Refrescar la lista de Lugar de Estacionamientos
      },
      error: (error) => {
        console.error('Error al eliminar el Lugar de Estacionamiento', error);
      }
    });

    if (tipo == true) { this.currentSection = 'initial' }

  }

  editingParkingSpace: any = null;




  updateParkingSpace(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    const confirmation = confirm('¿Está seguro de que desea modificar este Lugar de Estacionamiento?');
    if (!confirmation) {
      return; // Si el Lugar de Estacionamiento cancela, no hacemos nada
    }

    this._apiservice.updateParkingSpace(this.editingParkingSpace).subscribe({
      next: (response) => {
        console.log('Lugar de Estacionamiento actualizado exitosamente', response);
        this.editingParkingSpace = null; // Limpia la variable de edición;
        this.getParkingSpace(); // Refresca la lista de parkingSpace
        this.showSection('initial');
        form.resetForm();
      },
      error: (error) => {
        console.error('Error al actualizar el Lugar de Estacionamiento', error);
      }
    });
  }

  // Método para actualizar la sección actual mostrada
  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getParkingSpace') {

      this.getParkingSpace()

    }

  }

  loadTypeVehicles() {
    this._typeVehicleService.getTypeVehicles().subscribe(data => {
      this.typeVehicles = data;
    });
  }

}
