import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service';
import { ParkingSpaceService } from '../../services/parking-space.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { forkJoin } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './garages.component.html',
  styleUrl: './garages.component.css'
})
export class GaragesComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  currentSection: string = 'initial';
  private _apiservice = inject(GaragesService);
  private _parkingSpaceService = inject(ParkingSpaceService);
  private _reservationService = inject(ReservationService);
  private _authService = inject(AuthService);
  private socketService = inject(SocketService);
  private _notificationService = inject(NotificationService);

  ReservationsList: any[] = [];
  selectedReservation: any = null;

  filterLicensePlate: string = '';
  filterDateFrom: string = '';
  filterDateTo: string = '';

  totalReservationsOnProgress: number = 0;
  totalParkingSpaces: number = 0;
  totalParkingSpacesAvailable: number = 0;
  totalMoneyEarned: number = 0;
  totalReservationsAlltime: number = 0;
  activeTab: string = 'en_curso';
  parkingSpaces: any[] = [];
  activeReservations: any[] = [];
  errorMessage: string = '';
  paymentMethod: string = '';
  p: number = 1;

  serviceTickets: any[] = [];
  pendingTickets: any[] = [];
  inProgressTickets: any[] = [];
  completedTickets: any[] = [];
  totalPendingServices: number = 0;

  ngOnInit() {
    this.loadReservationsOnProgress();
    
    // Escuchar eventos de Socket.io para refrescar automáticamente
    this.subscriptions.push(
      this.socketService.on('reservation:created').subscribe(() => {
        this.loadReservationsOnProgress();
        if (this.currentSection === 'getReservations') this.getReservation();
      }),
      this.socketService.on('reservation:cancelled').subscribe(() => {
        this.loadReservationsOnProgress();
        if (this.currentSection === 'getReservations') this.getReservation();
      }),
      this.socketService.on('reservation:inProgress').subscribe(() => {
        this.loadReservationsOnProgress();
        if (this.currentSection === 'getReservations') this.getReservation();
      }),
      this.socketService.on('reservation:completed').subscribe(() => {
        this.loadReservationsOnProgress();
        if (this.currentSection === 'getReservations') this.getReservation();
      }),
      this.socketService.on('service:statusChanged').subscribe(() => {
        if (this.currentSection === 'tableroServicios') this.loadServiceBoard();
        if (this.currentSection === 'getReservations') this.getReservation();
        this.loadReservationsOnProgress();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.p = 1;
    this.getReservation();
  }

  clearFilters() {
    this.filterLicensePlate = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.p = 1;
    this.getReservation();
  }

  loadReservationsOnProgress() {
    const cuit = this._authService.getCurrentUserId();
    if (!cuit) {
      return;
    }

    const now = new Date();

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

        this.totalReservationsOnProgress = (results.reservations || []).length;


        if (Array.isArray(results.spaces)) {
          this.totalParkingSpaces = results.spaces.length;
        } else {
          this.totalParkingSpaces = 0;
        }
        this.totalMoneyEarned = (results.revenue as any).totalRevenue || 0;
        this.totalReservationsAlltime = results.reservations2 ? results.reservations2.length : 0;
        this.totalParkingSpacesAvailable = Math.max(0, this.totalParkingSpaces - this.totalReservationsOnProgress);
        this.parkingSpaces = Array.isArray(results.spaces) ? results.spaces : [];
        this.activeReservations = results.reservations || [];
        this.computePendingServicesCount(this.activeReservations);

        console.log(`Calculation Complete: ${this.totalParkingSpaces} Total - ${this.totalReservationsOnProgress} Occupied = ${this.totalParkingSpacesAvailable} Available`);
      },
      error: (err) => {
      }
    });
  }

formatDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

cancelReservation(reserva: any) {
    if (reserva.status === 'en_curso') {
      alert('No podés cancelar una reserva que ya está en curso.');
      return;
    }

    const ahora = new Date();
    const checkIn = new Date(reserva.check_in_at);
    const diferenciaMinutos = (checkIn.getTime() - ahora.getTime()) / (1000 * 60);

    if (diferenciaMinutos < 30) {
      this._notificationService.warning('No podés cancelar con menos de 30 min de anticipación.');
      return;
    }

    if (confirm('¿Estás seguro de que querés cancelar esta reserva?')) {
          this._reservationService.cancelReservation(reserva.id).subscribe({
            next: () => {
              this.getReservation();
              this._notificationService.success('Reserva cancelada correctamente.');
            },
            error: (error) => {
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
    this.p = 1;
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