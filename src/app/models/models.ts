export enum ReservationStatus {
  ACTIVE    = 'activa',
  IN_PROGRESS = 'en_curso',
  CANCELLED = 'cancelada',
  COMPLETED = 'completada',
}

export enum ServiceStatus {
  PENDIENTE   = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO  = 'completado',
}

export type ReservationTypeCode =
  | 'HOUR'
  | 'HALF_DAY'
  | 'DAY'
  | 'WEEKLY'
  | 'HALF_MONTH'
  | 'MONTH';


export interface Location {
  id: number;
  name: string;
  province: string;
}

export interface VehicleType {
  id: number;
  name: string;
}


export interface User {
  id: number;
  dni: string;
  name: string;
  lastname: string;
  address: string;
  email: string;
  phoneNumber: string;
}


export interface GarageService {
  id: number;
  description: string;
  price: number;
}

export interface Garage {
  cuit: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  location: Location;
  services?: GarageService[];
  estimatedPrice?: number;
}


export interface Vehicle {
  license_plate: string;
  owner?: User | number;
  type?: VehicleType;
}


export interface ParkingSpace {
  number: number;
  garage: number | string;
  TypeVehicle: VehicleType;
}


export interface ReservationType {
  description: ReservationTypeCode;
  price: number;
  garage?: number | string;
}

export interface PricingStatus {
  allSet: boolean;
  tiposFaltantes: ReservationTypeCode[];
}

// Servicio de reserva (tabla intermedia)

export interface ReservationServiceItem {
  id?: number;
  service: GarageService;
  status: ServiceStatus;
}

export interface Reservation {
  id: number;
  check_in_at: string;
  check_out_at: string;
  date_time_reservation?: string;
  status: ReservationStatus;
  amount: number;
  paymentMethod?: string;
  vehicle: Vehicle;
  garage: Garage;
  parkingSpace?: ParkingSpace;
  reservationServices?: ReservationServiceItem[];
}

//Autenticación

export interface LoginCredentials {
  dni: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number | string;
    name: string;
    type: string;
  };
}

// Disponibilidad

export interface AvailabilityResponse {
  available: boolean;
  message?: string;
}