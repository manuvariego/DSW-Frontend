import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ParkingSpaceService } from '../../services/parking-space.service';
import { TypeVehicleService } from '../../services/type-vehicle.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-parking-space',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './parking-space.component.html',
  styleUrl: './parking-space.component.css'
})
export class ParkingSpaceComponent {

  parkingCreated = false;
  message = '';
  isSuccess = false;
  currentSection: string = 'initial'
  typeVehicles: Array<any> = [];
  parkingSpaceList: any[] = []
  cuitGarage: string = ''
  vehicleTypeId: number | string = '';
  gridMaxNumber: number = 50;
  selectedSpaces: number[] = [];
  blockedSpaceIds: number[] = [];
  selectedSpace: any = null;
  p = 1; 

  private _apiservice = inject(ParkingSpaceService)
  private _typeVehicleService = inject(TypeVehicleService)
  private _authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  
  ParkingSpaceData = {

    number: '',
    garage: '',
    TypeVehicle: '',

  }

  ngOnInit() {
    this.loadTypeVehicles();
    this.cuitGarage = this._authService.getCurrentUserId() || '';
    if (this.cuitGarage) {
      this.getParkingSpace();
    }
    this.checkBlockedSpaces(this.cuitGarage, true);
  }


  selectParkingSpaceToEdit(ParkingSpace: any) {

    this.currentSection = 'selectParkingSpaceToEdit';
    this.editingParkingSpace = { ...ParkingSpace };

  }

  createParkingSpace(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.ParkingSpaceData.garage = this.cuitGarage;
    this._apiservice.createParkingSpace(this.ParkingSpaceData).subscribe({
      next: () => {
        this.parkingCreated = true;
        this.showSection('initial');
        form.resetForm();
        // Oculta el mensaje después de 3 segundos
        setTimeout(() => {
          this.parkingCreated = false;
        }, 3000);
      },
      error: (error) => {
      }
    });
  }


  createMultipleParkingSpaces() {
    if (this.selectedSpaces.length === 0 || !this.vehicleTypeId) return;

    let created = 0;
    const total = this.selectedSpaces.length;

    for (const num of this.selectedSpaces) {
      const spaceData = {
        number: num.toString(),
        garage: this.cuitGarage,
        TypeVehicle: this.vehicleTypeId
      };

      this._apiservice.createParkingSpace(spaceData).subscribe({
        next: () => {
          created++;
          if (created === total) {
            this.parkingCreated = true;
            this.selectedSpaces = [];
            this.getParkingSpace();
            this.showSection('initial');
            setTimeout(() => this.parkingCreated = false, 3000);
          }
        },
        error: (error) => {
        }
      });
    }
  }


  getGridNumbers(): number[] {
    return Array.from({ length: this.gridMaxNumber }, (_, i) => i + 1);
  }

  isSpaceExisting(num: number): boolean {
    return this.parkingSpaceList.some(s => Number(s.number) === num);
  }

  toggleSpaceSelection(num: number): void {
    const index = this.selectedSpaces.indexOf(num);
    if (index === -1) {
      this.selectedSpaces.push(num);
    } else {
      this.selectedSpaces.splice(index, 1);
    }
  }

  isSpaceSelected(num: number): boolean {
    return this.selectedSpaces.includes(num);
  }


  getParkingSpace() {
    this._apiservice.getParkingSpaceOfGarage(this.cuitGarage).subscribe((data: any[]) => {
      this.parkingSpaceList = Array.isArray(data) ? data : [data];
    });
  }

  deleteParkingSpace(numberParkingSpace: string) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este Lugar de Estacionamiento?');
    if (!confirmation) {
      return;
    }

    this._apiservice.deleteParkingSpace(numberParkingSpace, this.cuitGarage).subscribe({
      next: () => {
        this.selectedSpace = null;
        this.getParkingSpace();
        this.checkBlockedSpaces(this.cuitGarage, true);
        this.message = 'Espacio eliminado correctamente.';
        this.isSuccess = true;
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
      }
    });
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
      next: () => {
        this.selectedSpace = null;
        this.showSection('getParkingSpace');
        form.resetForm();
        this.editingParkingSpace = null;
        this.message = 'Espacio modificado correctamente.';
        this.isSuccess = true;
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
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

  checkBlockedSpaces(garageCuit: string, active: boolean) {
    this.reservationService. BlockedSpacesByGarage(garageCuit).subscribe({
      next: (response: any) => {
        const listaDeReservas = response.data || response;
        if (!Array.isArray(listaDeReservas)) {
          return;
        }

        const blockedSet = new Set<number>();

        listaDeReservas.forEach((r: any) => {
          const espacio = r.parkingSpace || r.parking_space || r.garage;

          if (espacio && espacio.number) {
            blockedSet.add((espacio.number));
          }
        });

        this.blockedSpaceIds = Array.from(blockedSet);},
      error: () => {}
    });
  }
  // Función para el HTML
  isSpaceBlocked(numberParkingSpace: number): boolean {
    return this.blockedSpaceIds.includes((numberParkingSpace));
  }

  selectSpace(space: any) {
    this.selectedSpace = this.selectedSpace?.number === space.number ? null : space;
  }

  getSpaceByNumber(num: number): any {
    return this.parkingSpaceList.find(s => Number(s.number) === num);
  }
}
