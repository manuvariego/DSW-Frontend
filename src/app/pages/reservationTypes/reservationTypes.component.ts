import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { ReservationTypesService } from '../../services/reservationTypes.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reservationTypes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservationTypes.component.html',
  styleUrl: './reservationTypes.component.css'
})

export class ReservationTypesComponent {

  message = '';
  isSuccess = false;
  private _apiservice = inject(ReservationTypesService) 
  reservationTypeList: any[] = [] 

  desc: string =''
  Cuit: string = ''
  aReservationType: any = null
  reservationType: any = null 
  editingReservationType: any = null
  pricingStatus: any = null
  tiposFaltantes: string[] = []
  garageCuit: string = ''
  preciosNuevos: any = {
    HOUR: null,
    HALF_DAY: null,
    DAY: null,
    WEEKLY: null,
    HALF_MONTH: null,
    MONTH: null
  }
  private _authService = inject(AuthService)
  private _notificationService = inject(NotificationService);
  
  reservationTypeData = {

    description: "",
    price: "",
    garage: ""

  }

  ngOnInit() {
    // Si es un garage logueado, cargar su estado de precios
    if (this._authService.isGarage()) {
      this.garageCuit = this._authService.getCurrentUserId() || '';
      this.loadPricingStatus();
      this.getReservationTypes();
    }
  }

  loadPricingStatus() {
    if (!this.garageCuit) return;
    
    this._apiservice.getPricingStatus(this.garageCuit).subscribe({
      next: (status) => {
        this.pricingStatus = status;
        this.tiposFaltantes = status.tiposFaltantes;
      },
      error: (error) => {
      }
    });
  }
  

  getReservationType(form: NgForm){
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return; // Detiene el envío si el formulario no es válido
    }
    

    this._apiservice.getReservationType(this.reservationTypeData.description, this.reservationTypeData.garage).subscribe(
      (reservationType: any) => {
        this.currentSection = "geTaReservationTypeTable"
        this.aReservationType = reservationType
        this.desc = ''
        this.Cuit = ''
      },
      (error) => {
        this._notificationService.warning('El tipo de reserva no existe o ocurrió un error.');
      }
    );
  }

  private ordenTipos = ['HOUR', 'HALF_DAY', 'DAY', 'WEEKLY', 'HALF_MONTH', 'MONTH'];

  getReservationTypes(){
    // Si es garage, obtener solo sus precios
    if (this._authService.isGarage() && this.garageCuit) {
      this._apiservice.getReservationTypesByGarage(this.garageCuit).subscribe((data: any[]) => {
        this.reservationTypeList = this.ordenarPorTipo(Array.isArray(data) ? data : [data]);
      });
    } else {
      this._apiservice.getReservationTypes().subscribe((data: any[]) => {
        this.reservationTypeList = this.ordenarPorTipo(Array.isArray(data) ? data : [data]);
      });
    }
  }

  private ordenarPorTipo(list: any[]): any[] {
    return list.sort((a, b) => this.ordenTipos.indexOf(a.description) - this.ordenTipos.indexOf(b.description));
  }

  changeTipodeReserva(reservationType:any){
    this.currentSection = 'editReservationType';
    this.editingReservationType = { ...reservationType }; 
  }
 
  updateReservationType() {
    const confirmation = confirm('¿Está seguro de que desea modificar este precio?');
    if (!confirmation) {
      return;
    }

    this._apiservice.updateReservationType(this.editingReservationType).subscribe({
      next: (response) => {
        this.editingReservationType = null;
        this.message = '¡Precio actualizado correctamente!';
        this.isSuccess = true;
        this.showSection('initReservationType');
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
        this._notificationService.warning('Error al actualizar el precio. Intente nuevamente.');
      }
    });
  }

  isGarage(): boolean {
    return this._authService.isGarage();
  }

  getNombreTipo(description: string): string {
    const nombres: { [key: string]: string } = {
      'HOUR': 'Por Hora',
      'HALF_DAY': 'Medio Día',
      'DAY': 'Por Día',
      'WEEKLY': 'Semanal',
      'HALF_MONTH': 'Quincenal',
      'MONTH': 'Mensual'
    };
    return nombres[description] || description;
  }

  tiposFaltantesTraducidos(): string[] {
    return this.tiposFaltantes.map(tipo => this.getNombreTipo(tipo));
  }

  deleteReservationType(desc: string, cuit:string,  type:boolean) {
    const confirmation = confirm('¿Está seguro de que desea eliminar este tipo de reserva?');
    if (!confirmation) {
      return; // Si el usuario cancela, no hacemos nada
    }
  
    this._apiservice.deleteReservationType(desc, cuit).subscribe({
      next: (response) => {
        this.getReservationTypes(); // Refrescar la lista
      },
      error: (error) => {
      }
    });

    if(type == true){this.currentSection = 'initReservationType'}
  }


  createReservationType(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this._apiservice.createReservationType(this.reservationTypeData).subscribe({
      next: (response) => {
        this.message = '¡Tipo de estadía creado exitosamente!';
        this.isSuccess = true;
        this.showSection('initReservationType');
        form.resetForm();
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
      }
    });
  }


  currentSection: String = 'initReservationType'

  showSection(section: string) {
    this.currentSection = section;

    if(section == 'initReservationType'){
      this.loadPricingStatus();
      this.getReservationTypes()
    }
  }

  guardarTodosLosPrecios(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    // Crear array de promesas para guardar todos los precios faltantes
    const promesas: Promise<any>[] = [];

    this.tiposFaltantes.forEach(tipo => {
      const precio = this.preciosNuevos[tipo];
      if (precio && precio > 0) {
        const data = {
          description: tipo,
          price: precio,
          garage: this.garageCuit
        };

        const promesa = new Promise((resolve, reject) => {
          this._apiservice.createReservationType(data).subscribe({
            next: (response) => resolve(response),
            error: (error) => reject(error)
          });
        });
        promesas.push(promesa);
      }
    });

    Promise.all(promesas)
      .then(() => {
        this.message = '¡Todos los precios fueron guardados correctamente!';
        this.isSuccess = true;
        this.loadPricingStatus();
        this.showSection('initReservationType');
        setTimeout(() => this.message = '', 3000);
        // Limpiar formulario ...
        this.preciosNuevos = {
          HOUR: null,
          HALF_DAY: null,
          DAY: null,
          WEEKLY: null,
          HALF_MONTH: null,
          MONTH: null
        };
      })
      .catch((error) => {
        this._notificationService.warning('Error al guardar los precios. Intente nuevamente.');
      });
  }

}