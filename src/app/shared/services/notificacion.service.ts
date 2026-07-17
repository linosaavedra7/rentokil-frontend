import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  constructor() {}

  notificacionExito(mensaje: string): void {
    Swal.fire({
      title: 'Éxito!',
      text: mensaje,
      icon: 'success',
      heightAuto: false,
      confirmButtonColor: '#0076c4',
    });
  }

  notificacionError(mensaje: string): void {
    Swal.fire({
      title: 'Error!',
      text: mensaje,
      icon: 'error',
      heightAuto: false,
      confirmButtonColor: '#0076c4',
    });
  }

  notificacionWarning(mensaje: string): void {
    Swal.fire({
      title: 'Alerta!',
      text: mensaje,
      icon: 'warning',
      heightAuto: false,
      confirmButtonColor: '#0076c4',
    });
  }
}
