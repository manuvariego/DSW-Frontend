import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';
import { ParkingSpaceService } from '../../services/parking-space.service.js';
import { AuthService } from '../../services/auth.service.js';
import { ReservationService } from '../../services/reservation.service.js';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './garages.component.html',
  styleUrl: './garages.component.css'
})
export class GaragesComponent {
  currentSection: string = 'initial';
  private _apiservice = inject(GaragesService);
  private _parkingSpaceService = inject(ParkingSpaceService);
  private _reservationService = inject(ReservationService);
  private _authService = inject(AuthService);

  ReservationsList: any[] = [];
  selectedReservation: any = null;

  filterLicensePlate: string = '';
  filterDateFrom: string = '';
  filterDateTo: string = '';

  totalResevartionsOnProgress: number = 0;
  totalParkingSpaces: number = 0;
  totalParkingSpacesAvailable: number = 0;
  totalMoneyEarned: number = 0;
  totalReservationsAlltime: number = 0;
  activeTab: string = 'activas';
  parkingSpaces: any[] = [];
  activeReservations: any[] = [];

  ngOnInit() {
    this.loadReservationsOnProgress();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.getReservation();
  }

  clearFilters() {
    this.filterLicensePlate = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.getReservation();
  }

  loadReservationsOnProgress() {
    const cuit = this._authService.getCurrentUserId();
    if (!cuit) {
      console.error('No CUIT found for current user.');
      return;
    }

    const now = new Date();
    const nowFormatted = now.toLocaleString('sv-SE').replace(' ', 'T');
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = startOfMonth.toLocaleString('sv-SE').replace(' ', 'T');

    const reservationsRequest$ = this._reservationService.getReservationsOfGarage(cuit, false, {
      status: 'activa'
    });

    const reservationsRequest$$ = this._reservationService.getReservationsOfGarage(cuit, false, {});

    const spacesRequest$ = this._parkingSpaceService.getParkingSpaceOfGarage(cuit);

    const revenueRequest$ = this._reservationService.getReservationsOfGarage(cuit, true, {
      status: 'completada',
      checkInDate: monthStart,
      checkOutDate: nowFormatted
    });

    forkJoin({
      reservations: reservationsRequest$,
      spaces: spacesRequest$,
      revenue: revenueRequest$,
      reservations2: reservationsRequest$$
    }).subscribe({
      next: (results) => {
        console.log('All dashboard data received:', results);

        this.totalResevartionsOnProgress = results.reservations ? results.reservations.length : 0;

        if (Array.isArray(results.spaces)) {
          this.totalParkingSpaces = results.spaces.length;
        } else {
          this.totalParkingSpaces = 0;
        }
        this.totalMoneyEarned = (results.revenue as any).totalRevenue || 0;
        this.totalReservationsAlltime = results.reservations2 ? results.reservations2.length : 0;
        this.totalParkingSpacesAvailable = Math.max(0, this.totalParkingSpaces - this.totalResevartionsOnProgress);
        this.parkingSpaces = Array.isArray(results.spaces) ? results.spaces : [];
        this.activeReservations = results.reservations || [];
        console.log(`Calculation Complete: ${this.totalParkingSpaces} Total - ${this.totalResevartionsOnProgress} Occupied = ${this.totalParkingSpacesAvailable} Available`);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
      }
    });
  }

  deleteReservation(reservationId: number) {
    const confirmation = confirm('¿Está seguro de que desea cancelar esta reserva?');
    if (!confirmation) {
      return;
    }

    this._reservationService.cancelReservation(reservationId).subscribe({
      next: (response) => {
        console.log('Reserva cancelada exitosamente', response);
        this.getReservation();
      },
      error: (error) => {
        console.error('Error al cancelar la reserva', error);
      }
    });
  }

  getReservation() {
    const cuit = this._authService.getCurrentUserId();
    if (!cuit) return;

    const filters: any = {};

    if (this.activeTab === 'activas') {
      filters.status = 'activa';
    } else if (this.activeTab === 'historial') {
      filters.status = 'completada';
    } else if (this.activeTab === 'canceladas') {
      filters.status = 'cancelada';
    }

    // Filtros manuales
    if (this.filterLicensePlate) {
      filters.vehicleLicensePlate = this.filterLicensePlate;
    }
    if (this.filterDateFrom) {
      filters.checkInDate = this.filterDateFrom;
    }
    if (this.filterDateTo) {
      filters.checkOutDate = this.filterDateTo;
    }

    this._reservationService.getReservationsOfGarage(cuit, false, filters).subscribe((data: any[]) => {
      if (Array.isArray(data)) {
        this.ReservationsList = data;
      } else {
        this.ReservationsList = [data];
      }
    });
  }

  applyReservationFilters() {
    this.getReservation();
  }

  viewReservationDetails(res: any) {
    this.selectedReservation = res;
  }

  isSpaceOccupied(spaceNumber: number): boolean {
    const now = new Date();
    return this.activeReservations.some(r => {
      const spaceMatch = r.parkingSpace?.number === spaceNumber || r.parking_space_number === spaceNumber;
      if (!spaceMatch) return false;
      const checkIn = new Date(r.check_in_at);
      const checkOut = new Date(r.check_out_at);
      return checkIn <= now && checkOut >= now;
    });
  }

  showSection(section: string) {
    this.currentSection = section;

    if (section == 'getReservations') {
      this.getReservation();
    }
  }
}