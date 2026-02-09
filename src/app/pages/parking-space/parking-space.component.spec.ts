import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParkingSpaceComponent } from './parking-space.component';
import { ParkingSpaceService } from '../../services/parking-space.service';
import { TypeVehicleService } from '../../services/type-vehicle.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

describe('ParkingSpaceComponent', () => {
  let component: ParkingSpaceComponent;
  let fixture: ComponentFixture<ParkingSpaceComponent>;

  // 1. Declaramos variables para los Mocks (Servicios falsos)
  let parkingServiceMock: any;
  let typeVehicleServiceMock: any;
  let authServiceMock: any;
  let reservationServiceMock: any;

  beforeEach(async () => {
    // 2. Creamos los espías (Spies) para simular los servicios
    // Esto evita que el test intente contactar al backend real.
    parkingServiceMock = jasmine.createSpyObj('ParkingSpaceService', [
      'getParkingSpaceOfGarage',
      'createParkingSpace',
      'deleteParkingSpace',
      'updateParkingSpace'
    ]);

    typeVehicleServiceMock = jasmine.createSpyObj('TypeVehicleService', ['getTypeVehicles']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    reservationServiceMock = jasmine.createSpyObj('ReservationService', ['BlockedSpacesByGarage']);

    // Configuración por defecto de las respuestas de los mocks
    authServiceMock.getCurrentUserId.and.returnValue('20123456789'); // Un CUIT falso
    typeVehicleServiceMock.getTypeVehicles.and.returnValue(of([{ id: 1, name: 'Auto' }]));
    parkingServiceMock.getParkingSpaceOfGarage.and.returnValue(of([])); // Inicialmente sin espacios
    parkingServiceMock.createParkingSpace.and.returnValue(of({}));
    parkingServiceMock.deleteParkingSpace.and.returnValue(of({}));
    parkingServiceMock.updateParkingSpace.and.returnValue(of({}));
    reservationServiceMock.BlockedSpacesByGarage.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      // Importamos el componente (porque es Standalone)
      imports: [ParkingSpaceComponent],
      // Proveemos los mocks en lugar de los servicios reales
      providers: [
        { provide: ParkingSpaceService, useValue: parkingServiceMock },
        { provide: TypeVehicleService, useValue: typeVehicleServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ReservationService, useValue: reservationServiceMock },
        // Mock básico para RouterLink si es necesario
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Esto dispara ngOnInit
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit debe cargar el CUIT, los tipos de vehículos y la lista de espacios', () => {
    // Assert
    expect(authServiceMock.getCurrentUserId).toHaveBeenCalled();
    expect(component.cuitGarage).toBe('20123456789');
    
    expect(typeVehicleServiceMock.getTypeVehicles).toHaveBeenCalled();
    expect(component.typeVehicles.length).toBe(1);

    expect(parkingServiceMock.getParkingSpaceOfGarage).toHaveBeenCalledWith('20123456789');
  });

  // --- TEST DE CREACIÓN ---
  it('createParkingSpace debe llamar al servicio si el formulario es válido', () => {
    // Arrange: Preparamos datos
    component.ParkingSpaceData = { number: '10', TypeVehicle: '1', garage: '' };
    
    // Simulamos un formulario válido
    const formMock = {
      invalid: false,
      resetForm: jasmine.createSpy('resetForm'),
      controls: {}
    } as any as NgForm;

    // Act: Ejecutamos el método
    component.createParkingSpace(formMock);

    // Assert: Verificaciones
    expect(parkingServiceMock.createParkingSpace).toHaveBeenCalled();
    expect(component.parkingCreado).toBeTrue(); // Verifica que se active la alerta
    expect(formMock.resetForm).toHaveBeenCalled();
  });

  it('createParkingSpace NO debe llamar al servicio si el formulario es inválido', () => {
    // Arrange
    const formMock = {
      invalid: true, // Formulario inválido
      controls: { number: { markAsTouched: jasmine.createSpy() } }
    } as any as NgForm;

    // Act
    component.createParkingSpace(formMock);

    // Assert
    expect(parkingServiceMock.createParkingSpace).not.toHaveBeenCalled();
  });

  // --- TEST DE ELIMINACIÓN ---
  it('deleteParkingSpace debe llamar al servicio si el usuario confirma', () => {
    // Arrange
    spyOn(window, 'confirm').and.returnValue(true); // Simulamos que el usuario dice "Aceptar"
    const espacioId = '10';

    // Act
    component.deleteParkingSpace(espacioId);

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(parkingServiceMock.deleteParkingSpace).toHaveBeenCalledWith(espacioId, component.cuitGarage);
    // Verifica que recargue la lista después de borrar
    expect(parkingServiceMock.getParkingSpaceOfGarage).toHaveBeenCalledTimes(2); // 1 en ngOnInit + 1 al borrar
  });

  it('deleteParkingSpace NO debe hacer nada si el usuario cancela', () => {
    // Arrange
    spyOn(window, 'confirm').and.returnValue(false); // Simulamos que el usuario dice "Cancelar"

    // Act
    component.deleteParkingSpace('10');

    // Assert
    expect(parkingServiceMock.deleteParkingSpace).not.toHaveBeenCalled();
  });

  // --- TEST DE CREACIÓN MÚLTIPLE (Lógica compleja) ---
  it('createMultipleParkingSpaces debe llamar al servicio tantas veces como espacios seleccionados', () => {
    // Arrange
    component.selectedSpaces = [1, 2, 3]; // 3 espacios seleccionados
    component.vehicleTypeId = 1; // Tipo seleccionado

    // Act
    component.createMultipleParkingSpaces();

    // Assert
    expect(parkingServiceMock.createParkingSpace).toHaveBeenCalledTimes(3);
    // Verificamos que se llamó con el número correcto en la primera llamada
    expect(parkingServiceMock.createParkingSpace.calls.argsFor(0)[0].number).toBe('1');
  });

  it('getGridNumbers debe devolver un array de 1 a N', () => {
    component.gridMaxNumber = 5;
    const result = component.getGridNumbers();
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});