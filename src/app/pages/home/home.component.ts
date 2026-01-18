import { Component, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as L from 'leaflet'; //librería para mapas

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {

  authService = inject(AuthService);

  constructor() { }

  ngOnInit(): void {
    const map = L.map('map').setView([-32.95435913192803, -60.64376536037566], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([-32.95435913192803, -60.64376536037566]).addTo(map)
      .bindPopup('Estacionamiento UTN')
      .openPopup();

    L.marker([-32.956056, -60.661444]).addTo(map)
      .bindPopup('Estacionamiento Parque Independencia')
      .openPopup();

    L.marker([-32.92750135, -60.6697378091253 ]).addTo(map)
      .bindPopup('Estacionamiento Alto Rosario Shopping')
      .openPopup();
    
    L.marker([-32.9479, -60.629752]).addTo(map)
      .bindPopup('Estacionamiento Monumento a la Bandera')
      .openPopup();

    // agregar mas marcadores donde nos parezca
  }
}

