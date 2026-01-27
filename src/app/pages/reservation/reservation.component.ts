import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service.js';
import { UsersService } from '../../services/users.service.js';
import { AuthService } from '../../services/auth.service.js';
import { VehiclesService } from '../../services/vehicles.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaragesService } from '../../services/garages.service.js';
import { Router, RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';



@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})

export class ReservationComponent implements OnInit {
  errorMessage: string = '';
  errorDateInvalid: string = '';
  reservationForm!: FormGroup;
  isDateInvalid: boolean = false;

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
  private fb: FormBuilder, 
  private reservationService: ReservationService, 
  private authService: AuthService, 
  private router: Router) {}  
  private _apiservice = inject(UsersService)
  private _apiserviceGarage = inject(GaragesService)
  private _vehiclesService = inject(VehiclesService)
  

  userID: string = ''
  userVehicles: any[] = []
  Garages: any[] = []
  theReservation: any = null
  availableServices: any[] = [];     // Los servicios que BRINDA la cochera 
  selectedServicesIds: number[] = []; // Los servicios que ELIGE el cliente 
  totalExtra: number = 0; // Para sumar $$ al precio final
  totalEstadia: number = 0;
  totalFinal: number = 0;
  selectedGarageName: string = '';
  currentSection: any = 'initial';
  paymentMethod: string = ''; //  efectivo o mercado pago
  selectedGarage: any = null
  myReservations: any[] = []
  reservasProximas: any[] = []
  reservasHistorial: any[] = []
  activeTab: string = 'proximas'


ngOnInit() {
    // para saber que usuario es el que está haciendo la reserva
    const storedId = this.authService.getCurrentUserId(); 

    if (storedId) {
      this.userID = storedId;
      console.log("Usuario detectado ID:", this.userID);
      
      // buscamos los vehículos de ese usuario
      this.getUserVehicles();
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
    const ahora = new Date();
    
    this.reservasProximas = this.myReservations.filter(r => {
      const fechaIngreso = new Date(r.check_in_at);
      return r.estado === 'activa' && fechaIngreso >= ahora;
    });
    
    this.reservasHistorial = this.myReservations.filter(r => {
      const fechaIngreso = new Date(r.check_in_at);
      return r.estado !== 'activa' || fechaIngreso < ahora;
    });
  }
    

  validateDates() {
    const checkIn = new Date(this.reservationData.check_in_at);
    const checkOut = new Date(this.reservationData.check_out_at);


    // Opcional: Si hay un campo específico para mostrar errores de fecha
    if (checkIn > checkOut) {
      this.errorDateInvalid = 'La fecha de entrada no puede ser posterior a la fecha de salida.';
      this.isDateInvalid = true;
    } else if (checkIn < new Date()) {
      this.errorDateInvalid = 'La fecha de entrada no puede ser anterior a hoy';
      this.isDateInvalid = true;
    } else {
      this.errorDateInvalid = ''; // Limpia el mensaje de error si las fechas son válidas
      this.isDateInvalid = false;
    }
  }



  saveGarage(aGarage: any) {
    this.selectedGarage = aGarage;
    this.reservationData.cuitGarage = aGarage.cuit
    this.selectedGarageName = aGarage.name
    this.availableServices = aGarage.services || [];
    this.selectedServicesIds = [];
    this.totalEstadia = aGarage.precioEstimado || 0;
    this.totalExtra = 0;
    this.totalFinal = this.totalEstadia;
    this.currentSection = 'services';
  }

  confirmOpenMaps() {
    if (this.selectedGarage) {
      if (confirm('¿Querés abrir esta ubicación en Google Maps?')) {
        const address = encodeURIComponent(`${this.selectedGarage.address}, ${this.selectedGarage.location}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
      }
    }
  }

  onServiceChange(event: any, service: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      this.selectedServicesIds.push(service.id);
      this.totalExtra += Number(service.price); 
    } else {
      this.selectedServicesIds = this.selectedServicesIds.filter(id => id !== service.id);
      this.totalExtra -= Number(service.price);
    }
    this.totalFinal = this.totalEstadia + this.totalExtra;
  }

  // métodos para que se haga el pago 
  
  goToPaymentSection() {
    this.currentSection = 'payment';
  }

  selectPaymentMethod(method: string) {
    this.paymentMethod = method;
  }

  createReservation() {
    const finalData = {
      ...this.reservationData, 
      services: this.selectedServicesIds
    };

    console.log("Enviando reserva con servicios:", finalData);
    console.log("Enviando reserva con precio:", finalData);

    this.reservationService.createReservation(finalData).subscribe({
      next: (response) => {
        console.log('Reserva creada exitosamente:', response);
        this.theReservation = response;
        this.currentSection = 'realizada'; 
        this.reservationData = { check_in_at: '', check_out_at: '', license_plate: '', cuitGarage: '' };
        this.filters = { check_in_at: '', check_out_at: '', license_plate: '' };

      },
      error: (error) => {
        console.error('Error al crear la reserva:', error);
        this.errorMessage = 'Hubo un error al procesar la reserva.';
      }
    });
  }

  showSection(section: string) {
    this.currentSection = section;

    if (this.currentSection == 'garages') {
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

  // MÉTODO PARA DESCARGAR COMPROBANTE EN PDF

  descargarComprobante(reserva: any) {
    const doc = new jsPDF();

    // PDF
    
    doc.setFillColor(33, 37, 41); 
    doc.rect(0, 0, 210, 40, 'F'); 
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PARKEASY', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Reserva', 140, 25);

  
    doc.setTextColor(0, 0, 0); 
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`ID Reserva: #${reserva.id}`, 140, 50);

  
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 55, 190, 55);

 
    let yPos = 70; 
    

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Estacionamiento', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
  
    const nombreCochera = reserva.garage?.name || 'Cochera ParkEasy';
    const direccionCochera = reserva.garage?.address || 'Dirección no disponible';
    
    doc.text(`Cochera: ${nombreCochera}`, 20, yPos);
    yPos += 8;
    doc.text(`Dirección: ${direccionCochera}`, 20, yPos);
    yPos += 15;


    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehículo', 20, yPos);
    yPos += 10;

    const patente = reserva.vehicle?.license_plate || reserva.vehicle || '---';
    const modelo = reserva.vehicle?.brand ? `${reserva.vehicle.brand} ${reserva.vehicle.model}` : 'Vehículo registrado';

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patente: ${patente}`, 20, yPos);
    yPos += 8;
    doc.text(`Vehículo: ${modelo}`, 20, yPos);

 
    yPos += 20;
    doc.setFillColor(248, 249, 250); 
    doc.rect(20, yPos, 170, 30, 'F');
    doc.rect(20, yPos, 170, 30, 'S'); 

    doc.setFontSize(10);
    doc.text('INGRESO', 40, yPos + 10);
    doc.text('SALIDA', 130, yPos + 10);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    

    const checkIn = new Date(reserva.check_in_at).toLocaleString();
    const checkOut = new Date(reserva.check_out_at).toLocaleString();

    doc.text(checkIn, 40, yPos + 20);
    doc.text(checkOut, 130, yPos + 20);

  
    yPos += 50;
    doc.setFontSize(16);
    doc.text(`TOTAL ABONADO: $${reserva.amount}`, 120, yPos);
    doc.setLineWidth(0.5);
    doc.line(120, yPos + 2, 190, yPos + 2); 

  
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Gracias por confiar en ParkEasy.', 20, 280);
    doc.text('Ante cualquier duda, contáctese con soporte.', 20, 285);

    doc.save(`reserva_${reserva.id}.pdf`);
  }

}