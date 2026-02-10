import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';
import { ParkingSpaceService } from '../../services/parking-space.service.js';
import { AuthService } from '../../services/auth.service.js';
import { ReservationService } from '../../services/reservation.service.js';
import { forkJoin } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
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
  activeTab: string = 'en_curso';
  parkingSpaces: any[] = [];
  activeReservations: any[] = [];
  errorMessage: string = '';
  paymentMethod: string = ''; //  efectivo o mercado pago
  p: number = 1; // Página actual para paginación

  // === TABLERO DE SERVICIOS ===
  serviceTickets: any[] = [];          // Lista plana: 1 ticket por cada (reserva, servicio)
  pendingTickets: any[] = [];          // Filtrado: estado 'pendiente'
  inProgressTickets: any[] = [];       // Filtrado: estado 'en_progreso'
  completedTickets: any[] = [];        // Filtrado: estado 'completado'
  totalPendingServices: number = 0;    // Contador para KPI del dashboard

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

    // 2. Úsala en tus variables
    const nowFormatted = this.formatDateTime(now); // Resultado: "2026-02-10 12:25:46"

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = this.formatDateTime(startOfMonth); // Resultado: "2026-02-01 00:00:00"

    const reservationsRequest$ = this._reservationService.getReservationsOfGarage(cuit, false, {
      status: 'en_curso'
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

        this.totalResevartionsOnProgress = (results.reservations || []).length;


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
        this.computePendingServicesCount(this.activeReservations);
        console.log(monthStart, nowFormatted);

        console.log(`Calculation Complete: ${this.totalParkingSpaces} Total - ${this.totalResevartionsOnProgress} Occupied = ${this.totalParkingSpacesAvailable} Available`);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
      }
    });
  }

formatDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

cancelReservation(reserva: any) {
    if (reserva.estado === 'en_curso') {
      alert('No podés cancelar una reserva que ya está en curso.');
      return;
    }

    const ahora = new Date();
    const checkIn = new Date(reserva.check_in_at);
    const diferenciaMinutos = (checkIn.getTime() - ahora.getTime()) / (1000 * 60);

    if (diferenciaMinutos < 30) {
      alert('No podés cancelar una reserva con menos de 30 minutos de anticipación.');
      return;
    }

    if (confirm('¿Estás seguro de que querés cancelar esta reserva?')) {
          this._reservationService.cancelReservation(reserva.id).subscribe({
            next: () => {
              console.log('Reserva cancelada exitosamente');
              this.getReservation();
            },
            error: (error) => {
              console.error('Error al cancelar la reserva:', error);
              this.errorMessage = 'No se pudo cancelar la reserva.';
            }
          });
        }
  }

  getReservation() {
    const cuit = this._authService.getCurrentUserId();
    if (!cuit) return;

    const filters: any = {};

    if (this.activeTab === 'activas') {
      filters.status = 'activa';
    } else if (this.activeTab === 'en_curso') {
      filters.status = 'en_curso';
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
    return this.activeReservations.some(r => {
      return r.parkingSpace?.number === spaceNumber || r.parking_space_number === spaceNumber;
    });
  }

  showSection(section: string) {
    scrollTo(0, 0);
    this.currentSection = section;

    if (section == 'getReservations') {
      this.getReservation();
    }
    if (section == 'tableroServicios') {
      this.loadServiceBoard();
    }
  }

  // === TABLERO DE SERVICIOS - MÉTODOS ===

  loadServiceBoard(): void {
    const cuit = this._authService.getCurrentUserId();
    if (!cuit) return;

    this._reservationService.getReservationsOfGarage(cuit, false, {
      status: 'en_curso'
    }).subscribe({
      next: (reservations: any[]) => {
        this.serviceTickets = [];

        for (const reservation of reservations) {
          // Solo reservas que tengan servicios contratados
          if (!reservation.reservationServices || reservation.reservationServices.length === 0) continue;

          for (const rs of reservation.reservationServices) {
            this.serviceTickets.push({
              reservationId: reservation.id,
              serviceId: rs.service.id,
              serviceDescription: rs.service.description,
              servicePrice: rs.service.price,
              licensePlate: reservation.vehicle?.license_plate || 'N/A',
              ownerName: `${reservation.vehicle?.owner?.name || ''} ${reservation.vehicle?.owner?.surname || ''}`.trim() || 'Desconocido',
              checkInAt: reservation.check_in_at,
              parkingSpaceNumber: reservation.parkingSpace?.number || null,
              status: rs.status || 'pendiente'
            });

          }
        }

        this.categorizeTickets();
      },
      error: (err) => {
        console.error('Error cargando tablero de servicios:', err);
      }
    });
  }

  private categorizeTickets(): void {
    this.pendingTickets = this.serviceTickets.filter(t => t.status === 'pendiente');
    this.inProgressTickets = this.serviceTickets.filter(t => t.status === 'en_progreso');
    this.completedTickets = this.serviceTickets.filter(t => t.status === 'completado');
    this.totalPendingServices = this.pendingTickets.length;
  }

  advanceServiceStatus(ticket: any): void {
    let newStatus = '';

    if (ticket.status === 'pendiente') {
      newStatus = 'en_progreso';
    } else if (ticket.status === 'en_progreso') {
      newStatus = 'completado';
    } else {
      return;
    }

    this._reservationService.updateServiceStatus(ticket.reservationId, ticket.serviceId, newStatus).subscribe({
      next: () => {
        ticket.status = newStatus;
        this.categorizeTickets();
      },
      error: (err) => {
        console.error('Error actualizando estado del servicio:', err);
      }
    });
  }

  private computePendingServicesCount(reservations: any[]): void {
    let count = 0;

    for (const reservation of reservations) {
      if (!reservation.reservationServices || reservation.reservationServices.length === 0) continue;

      for (const rs of reservation.reservationServices) {
        if (rs.status === 'pendiente') {
          count++;
        }
      }
    }

    this.totalPendingServices = count;
  }
}