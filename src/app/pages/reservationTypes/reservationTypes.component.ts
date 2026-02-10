import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationTypesService } from '../../services/reservationTypes.service.js';
import { AuthService } from '../../services/auth.service.js';
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
        console.log('Estado de precios:', status);
      },
      error: (error) => {
        console.error('Error al cargar estado de precios:', error);
      }
    });
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
        console.log('Precio actualizado exitosamente', response);
        this.editingReservationType = null;
        this.message = '¡Precio actualizado correctamente!';
        this.isSuccess = true;
        this.showSection('initReservationType');
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
        console.error('Error al actualizar el precio', error);
        alert('Error al actualizar el precio. Intente nuevamente.');
      }
    });
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
        console.log('Todos los precios guardados exitosamente');
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
        console.error('Error al guardar precios:', error);
        alert('Ocurrió un error al guardar los precios. Intente nuevamente.');
      });
  }

}