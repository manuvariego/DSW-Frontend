import { Component, OnInit} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const map = L.map('map').setView([-32.95435913192803, -60.64376536037566], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([-32.95435913192803, -60.64376536037566]).addTo(map)
      .bindPopup('Ubicación de ParkEasy')
      .openPopup();
  }
}

