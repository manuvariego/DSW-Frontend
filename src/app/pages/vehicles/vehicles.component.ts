import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiclesService } from '../../services/vehicles.service';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TypeVehicleService } from '../../services/type-vehicle.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../services/notification.service';


@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent {

  message = '';
  isSuccess = false;
  private _apiservice = inject(VehiclesService)
  private _typeVehicleService = inject(TypeVehicleService)
  private _authService = inject(AuthService)
  private _reservationService = inject(ReservationService)
  private _notificationService = inject(NotificationService)
  vehiclesList: any[] = []
  typeVehicles: Array<any> = [];
  licensePlate: string = ''
  aVehicle: any = null
  editingVehicle: any = null
  blockedPlates: string[] = [];

  currentSection: String = 'initVehicles'

  vehicleData = {

    license_plate: "",
    owner: "",
    type: ""

  }


  ngOnInit() {
    const userId = this._authService.getCurrentUserId();
    if (userId) {
    this.loadTypeVehicles(); // Cargar los tipos al iniciar
    this.checkBlockedVehicles(userId);
  }
}

// método para saber cuales son los vehiculos que tienen reservas para que no se puedan eliminar
checkBlockedVehicles(userId: number | string) {
  this._reservationService.getReservationsByUser(userId).subscribe({
    next: (reservas: any[]) => {
      const patentesUsadas = reservas.map(r => r.vehicle?.license_plate || r.vehicle);
      this.blockedPlates = [...new Set(patentesUsadas)];
      
    }
  });
}

// Función auxiliar para el HTML
isVehicleBlocked(plate: string): boolean {
  return this.blockedPlates.includes(plate);
}

  getAvehicle(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Detiene el envío si el formulario no es válido
    }


    this._apiservice.getVehicle(this.licensePlate).subscribe(
      (vehicle: any) => {
        this.currentSection = "geTaVehicleTable"
        this.aVehicle = vehicle
        this.licensePlate = ''
      },
      (error) => {
        this._notificationService.warning('El vehículo no existe o ocurrió un error.');
      }
    );
  }


  getVehicles() {
    const userId = this._authService.getCurrentUserId();
    
    if (!userId) {
      return;
    }

    this._apiservice.getVehiclesByOwner(Number(userId)).subscribe((data: any[]) => {
      if (Array.isArray(data)) {
        this.vehiclesList = data
      } else {
        this.vehiclesList = [data]
      }
    })
  }


  changeVehicle(vehicle: any) {

    this.currentSection = 'editVehicle';
    this.editingVehicle = { ...vehicle };

  }

  updateVehicle(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    const confirmation = confirm('¿Está seguro de que desea modificar este vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.updateVehicle(this.editingVehicle).subscribe({
      next: (response) => {
        this.editingVehicle = null; // Limpia la variable de edición
        this.getVehicles(); // Refresca la lista de vehiculos
        this.showSection('initVehicles');
        form.resetForm();
      },
      error: (error) => {
      }
    });
  }

  deleteVehicle(license_plate: string, type: boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este vehiculo?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }

    this._apiservice.deleteVehicle(license_plate).subscribe({
      next: (response) => {
        this.message = 'Vehículo eliminado correctamente.';
        this.isSuccess = true;
        this.getVehicles();

        if (type == true) { this.currentSection = 'initVehicles' }

        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      error: (error) => {
        this.message = 'Error al eliminar el vehículo.';
        this.isSuccess = false;

        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    });
  }

  createVehicle(form: NgForm) {

    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.vehicleData.owner = this._authService.getCurrentUserId() || '';

    this._apiservice.createVehicle(this.vehicleData).subscribe({
      next: (response) => {
        this.message = 'Vehículo creado exitosamente.';
        this.isSuccess = true;
        this.showSection('initVehicles');
        form.resetForm();

        setTimeout(() => {
          this.message = '';
        }, 3000);
        this.getVehicles();
        this.vehicleData = { license_plate: '', type: '', owner: '' };
      },
      error: (error) => {
      }
    });
  }

  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getVehicles') {

      this.getVehicles()

    }

  }


  loadTypeVehicles() {
    this._typeVehicleService.getTypeVehicles().subscribe(data => {
      this.typeVehicles = data;
    });
  }





}