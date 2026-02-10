import { Component, OnInit, inject } from '@angular/core';
import { ReservationService } from '../../services/reservation.service.js';
import { UsersService } from '../../services/users.service.js';
import { AuthService } from '../../services/auth.service.js';
import { VehiclesService } from '../../services/vehicles.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';
import { Router, RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})

export class ReservationComponent implements OnInit {
  errorMessage: string = '';
  errorDateInvalid: string = '';
  isDateInvalid: boolean = false;

  // Variables nuevas para controlar el estado
isVehicleBusy: boolean = false;
availabilityMessage: string = '';
isValidating: boolean = false;

  reservationData = {

    check_in_at: '',
    check_out_at: '',
    license_plate: '',
    cuitGarage: '',

  }

  filters = {
    check_in_at: '',
    check_out_at: '',
    license_plate: '',

  }

  constructor(
  private reservationService: ReservationService, 
  private authService: AuthService, 
  private router: Router) {}  
  private _apiservice = inject(UsersService)
  private _apiserviceGarage = inject(GaragesService)
  private _vehiclesService = inject(VehiclesService)
  private route = inject(ActivatedRoute);
  

  userID: string = ''
  userVehicles: any[] = []
  Garages: any[] = []
  theReservation: any = null
  availableServices: any[] = [];     // Los servicios que BRINDA la cochera 
  selectedServicesIds: any[] = []; // Los servicios que ELIGE el cliente 
  totalExtra: number = 0; // Para sumar $$ al precio final
  totalEstadia: number = 0;
  totalFinal: number = 0;
  selectedGarageName: string = '';
  paymentMethod: string = ''; //  efectivo o mercado pago
  selectedGarage: any = null
  myReservations: any[] = []
  reservasProximas: any[] = []
  reservasHistorial: any[] = []
  activeTab: string = 'proximas'
  selectedReservation: any = null
    // History filters
  statusFilter: string = 'all';      // 'all' | 'completada' | 'cancelada'
  vehicleFilter: string = '';        // license plate or empty for all
  p: number = 1;

  currentSection: any = 'menu';

ngOnInit() {
    // para saber que usuario es el que está haciendo la reserva
    const storedId = this.authService.getCurrentUserId();

    if (storedId) {
      this.userID = storedId;
      console.log("Usuario detectado ID:", this.userID);

      // buscamos los vehículos de ese usuario
      this.getUserVehicles();

      // Leer query param para ir directo a una sección
      const section = this.route.snapshot.queryParamMap.get('section');
      if (section) {
        this.showSection(section);
      }
    } else {
      console.warn("No hay usuario logueado.");
      this.router.navigate(['/login']); // Si no hay usuario, se va al login
    }
  }

  getMyReservations() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;
    this.reservationService.getReservationsByUser(Number(userId)).subscribe({
      next: (data: any) => {
        console.log("Reservas cargadas:", data);
        this.myReservations = data;
        this.filterReservations();
      },
      error: (error) => {
        console.error("Error cargando reservas:", error);
        this.errorMessage = "No se pudieron cargar tus reservas.";
      }
    });
  }

  getUserVehicles() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;
    
    this._vehiclesService.getVehiclesByOwner(Number(userId)).subscribe({
      next: (data: any) => {
        console.log("Vehículos cargados:", data);
        this.userVehicles = data;
      },
      error: (error) => {
        console.error("Error cargando vehículos:", error);
        this.errorMessage = "No se pudieron cargar tus vehículos.";
      }
    });
  }
  

  getGaragesAvailables() {
    this.reservationService.getGaragesAvailables(this.filters).subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.Garages = data;
        } else {
          this.Garages = [data];
        }
        this.errorMessage = ''; // Limpiar mensaje de error si la solicitud es exitosa
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener cocheras disponibles:', error);
        this.errorMessage = 'Error al obtener los datos. Verifique la información ingresada e intente nuevamente.';
      }
    );
  }

  filterReservations() {
    
    this.reservasProximas = this.myReservations.filter(r => {
      return r.estado === 'activa' || r.estado === 'en_curso';
    });
    
    this.reservasProximas.sort((a, b) => {
      return new Date(a.check_in_at).getTime() - new Date(b.check_in_at).getTime();
    });
    
    this.reservasHistorial = this.myReservations.filter(r => {
      return r.estado !== 'activa' && r.estado !== 'en_curso';
    });

    this.reservasHistorial.sort((a, b) => {
     return new Date(b.check_in_at).getTime() - new Date(a.check_in_at).getTime();
    });
  }
    

  validateDates() {
    const checkIn = new Date(this.reservationData.check_in_at);
    const checkOut = new Date(this.reservationData.check_out_at);

    if (checkIn > checkOut) {
      this.errorDateInvalid = 'La fecha de entrada no puede ser posterior a la fecha de salida.';
      this.isDateInvalid = true;
    } else if (checkIn < new Date()) {
      this.errorDateInvalid = 'La fecha de entrada no puede ser anterior a hoy';
      this.isDateInvalid = true;
    } else {
      this.errorDateInvalid = '';
      this.isDateInvalid = false;
    }
  }


  get minCheckIn(): string {
    return this.formatDateTimeLocal(new Date());
  }

  get minCheckOut(): string {
    if (this.reservationData.check_in_at) {
      return this.reservationData.check_in_at;
    }
    return this.minCheckIn;
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  }

  onCheckInChange() {
    this.validateDates();
    if (this.reservationData.check_out_at && this.reservationData.check_in_at) {
      if (this.reservationData.check_out_at < this.reservationData.check_in_at) {
        this.reservationData.check_out_at = '';
      }
    }
  }

  viewReservationDetails(reservation: any) {
    this.selectedReservation = reservation;
    console.log("Mostrando detalles de la reserva:", reservation);
    this.currentSection = 'reservationDetails';
  }


  saveGarage(aGarage: any) {
    this.selectedGarage = aGarage;
    this.reservationData.cuitGarage = aGarage.cuit
    this.selectedGarageName = aGarage.name
    this.availableServices = aGarage.services || [];
    this.selectedServicesIds = [];
    this.totalEstadia = Math.round(aGarage.precioEstimado || 0);
    this.totalExtra = 0;
    this.totalFinal = this.totalEstadia;
    this.currentSection = 'services';
  }

  confirmOpenMaps() {
    // Determinar qué garage usar
    const garage = this.selectedGarage || this.selectedReservation?.garage;
    
    if (garage) {
      if (confirm('¿Querés abrir esta ubicación en Google Maps?')) {
        const locationName = garage.location?.name ? `${garage.location.name}, ${garage.location.province}` : garage.location;
        const address = encodeURIComponent(`${garage.address}, ${locationName}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
      }
    }
  }

  onServiceChange(event: any, service: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedServicesIds.push(service.id);
      console.log(this.selectedServicesIds)
      this.totalExtra += Number(service.price); 
    } else {
      this.selectedServicesIds = this.selectedServicesIds.filter(id => id !== service.id);
      this.totalExtra -= Number(service.price);
    }
    this.totalFinal = Math.round(this.totalEstadia + this.totalExtra);
  }

  // métodos para que se haga el pago 
  
  goToPaymentSection() {
    this.currentSection = 'payment';
  }

  selectPaymentMethod(method: string) {
    this.paymentMethod = method;
  }

  createReservation() {
    this.errorMessage = ''; 

    const finalData = {
      ...this.reservationData, 
      services: this.selectedServicesIds,
      totalPrice: this.totalFinal, 
      paymentMethod: this.paymentMethod
    };

    console.log("Enviando reserva:", finalData);

    this.reservationService.createReservation(finalData).subscribe({
      next: (response) => {
        console.log('Reserva creada exitosamente:', response);
        this.theReservation = response;

        if (this.paymentMethod === 'MP') {
            const linkMercadoPago = 'https://link.mercadopago.com.ar'; 
            window.open(linkMercadoPago, '_blank');
        }
        
        this.currentSection = 'realizada'; 
        this.reservationData = { check_in_at: '', check_out_at: '', license_plate: '', cuitGarage: '' };
        this.filters = { check_in_at: '', check_out_at: '', license_plate: '' };
      },
      error: (err) => {
        console.error('Error al crear la reserva:', err);
        
        // MANEJO DEL ERROR DE SUPERPOSICIÓN
        if (err.status === 400) {
            const backendMessage = err.error.message || 'El vehículo no está disponible en esas fechas.';
            
            this.errorMessage = backendMessage;

            Swal.fire({
                icon: 'error',
                title: 'No disponible',
                text: backendMessage, // "El vehículo ya tiene una reserva..."
                confirmButtonColor: '#d33'
            });
        } else {
            this.errorMessage = 'Hubo un error técnico. Intente más tarde.';
            Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
        }
      }
    });
}

  showSection(section: string) {
    this.currentSection = section;
    if (this.currentSection == 'garages') {
      this.filters.check_in_at = this.reservationData.check_in_at;
      this.filters.check_out_at = this.reservationData.check_out_at;
      this.filters.license_plate = this.reservationData.license_plate;
      this.getGaragesAvailables();
    }
    if (section == 'misReservas') {
      this.getMyReservations();
    }
  }

  cancelReservation(reserva: any) {
    const ahora = new Date();
    const checkIn = new Date(reserva.check_in_at);
    const diferenciaMinutos = (checkIn.getTime() - ahora.getTime()) / (1000 * 60);
    

    if (reserva.estado === 'en_curso') {
      alert('No podés cancelar una reserva que ya está en curso.');
      return;
    } 

    if (diferenciaMinutos < 30) {
      alert('No podés cancelar una reserva con menos de 30 minutos de anticipación.');
      return;
    }

    if (confirm('¿Estás seguro de que querés cancelar esta reserva?')) {
          this.reservationService.cancelReservation(reserva.id).subscribe({
            next: () => {
              console.log('Reserva cancelada exitosamente');
              this.getMyReservations();
            },
            error: (error) => {
              console.error('Error al cancelar la reserva:', error);
              this.errorMessage = 'No se pudo cancelar la reserva.';
            }
          });
        }
  }

  get filteredHistory(): any[] {
    return this.reservasHistorial.filter(reservation => {
      // Status filter
      const matchesStatus = this.statusFilter === 'all' ||
                            reservation.estado === this.statusFilter;

      // Vehicle filter
      const matchesVehicle = !this.vehicleFilter ||
                            reservation.vehicle?.license_plate === this.vehicleFilter;

      return matchesStatus && matchesVehicle;
  });
}

getServicesTotal(reservationServices: any[]): number {
  if (!reservationServices || reservationServices.length === 0) return 0;
  return reservationServices.reduce((sum: number, rs: any) => sum + (Number(rs.service?.price) || 0), 0);
}

  downloadpdf(reserva: any) {
    const doc = new jsPDF();

    // === HEADER ===
    doc.setFillColor(33, 37, 41);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PARKEASY', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Reserva', 140, 25);

    // === INFO BÁSICA ===
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`ID Reserva: #${reserva.id}`, 140, 50);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 55, 190, 55);

    let yPos = 65;

    // === DATOS DEL ESTACIONAMIENTO ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Estacionamiento', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const garageName = reserva.garage?.name || 'Cochera ParkEasy';
    const address = reserva.garage?.address || 'Dirección no disponible';
    const location = reserva.garage?.location ? 
      `${reserva.garage.location.name}, ${reserva.garage.location.province}` : '';
    const phoneNumber = reserva.garage?.phoneNumber || '-';
    const email = reserva.garage?.email || '-';
    const parkingSpaceNumber = reserva.parkingSpace?.number || '-';

    doc.text(`Cochera: ${garageName}`, 20, yPos);
    yPos += 6;
    doc.text(`Dirección: ${address}${location ? ', ' + location : ''}`, 20, yPos);
    yPos += 6;
    doc.text(`Teléfono: ${phoneNumber}    |    Email: ${email}`, 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Espacio asignado: #${parkingSpaceNumber}`, 20, yPos);
    yPos += 12;

    // === VEHÍCULO ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehículo', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const licensePlate = reserva.vehicle?.license_plate || '-';
    doc.text(`Patente: ${licensePlate}`, 20, yPos);
    yPos += 12;

    // === FECHAS ===
    doc.setFillColor(248, 249, 250);
    doc.rect(20, yPos, 170, 28, 'F');
    doc.rect(20, yPos, 170, 28, 'S');

    doc.setFontSize(9);
    doc.text('INGRESO', 50, yPos + 8);
    doc.text('SALIDA', 140, yPos + 8);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const checkIn = new Date(reserva.check_in_at).toLocaleString();
    const checkOut = new Date(reserva.check_out_at).toLocaleString();
    doc.text(checkIn, 35, yPos + 18);
    doc.text(checkOut, 125, yPos + 18);
    yPos += 35;

    // === SERVICIOS (si hay) ===
    const reservationServices = reserva.reservationServices || [];
    if (reservationServices.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Servicios Contratados', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      let totalServices = 0;
      reservationServices.forEach((rs: any) => {
        const price = Number(rs.service?.price) || 0;
        totalServices += price;
        doc.text(`• ${rs.service?.description || rs.service?.name}`, 25, yPos);
        doc.text(`$${price}`, 170, yPos, { align: 'right' });
        yPos += 6;
      });
      yPos += 6;
    }

    // === DETALLE DE PAGO ===
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Calcular subtotales
    const totalServices = reservationServices.reduce((sum: number, rs: any) => sum + (Number(rs.service?.price) || 0), 0);
    const totalReservation = reserva.amount - totalServices;

    doc.text('Estadía:', 120, yPos);
    doc.text(`$${totalReservation}`, 180, yPos, { align: 'right' });
    yPos += 7;

    if (totalServices > 0) {
      doc.text('Servicios:', 120, yPos);
      doc.text(`+ $${totalServices}`, 180, yPos, { align: 'right' });
      yPos += 7;
    }

    doc.setDrawColor(100, 100, 100);
    doc.line(120, yPos, 190, yPos);
    yPos += 7;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 120, yPos);
    doc.text(`$${reserva.amount}`, 180, yPos, { align: 'right' });

    // === FOOTER ===
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Gracias por confiar en ParkEasy.', 20, 280);
    doc.text('Ante cualquier duda, contáctese con soporte.', 20, 285);

    doc.save(`reserva_${reserva.id}.pdf`);
  }

validateAvailability() {
  if (!this.reservationData.license_plate || !this.filters.check_in_at || !this.filters.check_out_at) {
    return;
  }

  this.isValidating = true;
  this.errorMessage = '';

  this.reservationService.checkVehicleAvailability(
    this.reservationData.license_plate, 
    this.filters.check_in_at, 
    this.filters.check_out_at
  ).subscribe({
    next: (res: any) => {
      this.isValidating = false;
      
      if (res.available === false) {
        // OCUPADO
        this.isVehicleBusy = true;
        this.availabilityMessage = res.message; // Mensaje del backend
      } else {
        // LIBRE
        this.isVehicleBusy = false;
        this.availabilityMessage = '';
      }
    },
    error: (err) => {
      this.isValidating = false;
      console.error("Error validando disponibilidad", err);
    }
  });
}

}