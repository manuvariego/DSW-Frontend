import { inject, Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {

  private socket: Socket;
  private ngZone = inject(NgZone);

  constructor() {
    this.socket = io(environment.socketUrl);

    this.socket.on('connect', () => {
      this.joinRoom();
    });

    this.socket.on('disconnect', () => {
    });
  }

  // Se une a la sala correspondiente según el rol en localStorage
  joinRoom() {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (userId && role) {
      if (role === 'garage') {
        this.joinGarage(userId);
      } else {
        this.joinUser(userId);
      }
    }
  }

  // Se une a la sala del garage (para que le lleguen eventos de SUS reservas)
  joinGarage(cuit: string) {
    this.socket.emit('join:garage', cuit);
  }

  // Se une a la sala del usuario
  joinUser(userId: string) {
    this.socket.emit('join:user', userId);
  }

  // Desconecta y limpia todos los listeners (usar al hacer logout)
  disconnect() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  // Reconecta el socket (usar después de login)
  connect() {
    this.socket.connect();
  }

  // Método genérico: escucha un evento y devuelve un Observable
  // Los componentes se suscriben a esto para reaccionar a los eventos
  on(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(event, (data: any) => {
        this.ngZone.run(() => {
          observer.next(data);
        });
      });
    });
  }
}