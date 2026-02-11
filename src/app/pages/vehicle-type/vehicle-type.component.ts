import { Component, inject } from '@angular/core';
import { TypeVehicleService } from '../../services/type-vehicle.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';


@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-type.component.html',
  styleUrl: './vehicle-type.component.css'
})
export class VehicleTypeComponent {

  tipoVehiculoCreado = false
  currentSection: String = 'initial'
  private _apiservice = inject(TypeVehicleService)
  typeVehiclesList: any[] = []
  idType: string = ''
  aTypeVehicle: any = null
  editingTypeVehicle: any = null

  typeVehicleData = {

    id: '',
    name: '',

  }


  getATypevehicle(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Detiene el envío si el formulario no es válido
    }


    this._apiservice.getTypeVehicle(this.idType).subscribe(
      (typeVehicle: any) => {
        this.currentSection = "geTaTypeVehicleTable"
        this.aTypeVehicle = typeVehicle
        this.idType = ''
      },
      (error) => {
        alert('El tipo de Vehiculo no existe o ocurrió un error al obtener la información.');
      }
    );
  }


  getTypeVehicles() {

    this._apiservice.getTypeVehicles().subscribe((data: any[]) => {


      if (Array.isArray(data)) {
        this.typeVehiclesList = data

      } else {

        this.typeVehiclesList = [data]
      }


    })


  }


  modificarTipoVehiculo(typeVehicle: any) {

    this.currentSection = 'editTypeVehicle';
    this.editingTypeVehicle = { ...typeVehicle };

  }

  updateTypeVehicle(form: NgForm) {

    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    const confirmation = confirm('¿Está seguro de que desea modificar este tipo de Vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateTypeVehicle(this.editingTypeVehicle).subscribe({
      next: (response) => {
        this.editingTypeVehicle = null; // Limpia la variable de edición
        this.showSection('initial')
        form.resetForm()
      },
      error: (error) => {
      }
    });
  }

  deleteTypeVehicle(license_plate: string, type: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.deleteTypeVehicle(license_plate).subscribe({
      next: (response) => {
        this.getTypeVehicles(); // Refrescar la lista de usuarios
      },
      error: (error) => {
      }
    });


    if (type == true) { this.currentSection = 'initial' }
  }


  createTypeVehicle(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this._apiservice.createTypeVehicle(this.typeVehicleData).subscribe({
      next: (response) => {
        this.tipoVehiculoCreado = true;
        this.showSection('initial');
        form.resetForm();

        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.tipoVehiculoCreado = false;
        }, 3000);
      },
      error: (error) => {
      }
    });
  }




  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getTypeVehicles') {

      this.getTypeVehicles()

    }

  }


}



