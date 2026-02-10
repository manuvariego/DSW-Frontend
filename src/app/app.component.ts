import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SocketService } from './services/socket.service';
import { NotificationService } from './services/notification.service';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ReactiveFormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {

  authService = inject(AuthService);
  router = inject(Router);
  private socketService = inject(SocketService);
  private notificationService = inject(NotificationService);
  private socketInitialized = false;

  menuOption = '';

  ngOnInit() {
    this.setupSocket();

    // Re-configurar socket después de login (ngOnInit solo corre una vez)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.authService.isLoggedIn() && !this.socketInitialized) {
        this.setupSocket();
      }
    });
  }

  setupSocket() {
    if (!this.authService.isLoggedIn()) return;

    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.socketService.connect();
    this.socketInitialized = true;

    if (this.authService.isGarage()) {
      this.socketService.joinGarage(userId);

      this.socketService.on('reservation:created').subscribe(() => {
        this.notificationService.info('Nueva reserva recibida');
      });

      this.socketService.on('reservation:inProgress').subscribe(() => {
        this.notificationService.info('Hay una nueva reserva en curso');
      });

    } else if (this.authService.isUser()) {
      this.socketService.joinUser(userId);

      this.socketService.on('reservation:inProgress').subscribe(() => {
        this.notificationService.info('Comenzó tu reserva');
      });
    }
  }

  onOption(option: string) {
    this.menuOption = option;
  }

  logout() {
    this.socketService.disconnect();
    this.socketInitialized = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

