import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 8000,
    timerProgressBar: true,
    showCloseButton: true,
  });

  info(title: string) {
    this.toast.fire({ icon: 'info', title });
  }

  success(title: string) {
    this.toast.fire({ icon: 'success', title });
  }

  warning(title: string) {
    this.toast.fire({ icon: 'warning', title });
  }
}
