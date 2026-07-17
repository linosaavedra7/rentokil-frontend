import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificacionService } from '../../../shared/services/notificacion.service';
import { environment } from 'src/environments/environment.prod';

const httpConfig = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class AsignacionClientesManualService {
  constructor(
    private http: HttpClient,
    private servicioNotificaciones: NotificacionService
  ) {}

  private manejarError<T>(metodo = 'metodo', resultado?: T) {
    return (error: any): Observable<T> => {
      this.servicioNotificaciones.notificacionError(
        `${metodo}: ${error.message}`
      );
      return of(resultado as T);
    };
  }

  obtenerNotasDeVentaNuevas(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/nv_nuevas_manual/`)
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener los clientes nuevos',
            []
          )
        )
      );
  }

  obtenerServicios(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/serv_nv_nuevas_manual/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener los servicios del cliente seleccionado',
            []
          )
        )
      );
  }

  obtenerRestriccion(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/restricciones_nv_manual/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener la restricción del cliente seleccionado',
            false
          )
        )
      );
  }

  generarPropuesta(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/manual_opt_asig2/`, datos, httpConfig)
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al generar la propuesta de asignación',
            false
          )
        )
      );
  }

  guardarPropuesta(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/guardar_resultado_asig_manual/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al guardar la propuesta de asignación.',
            false
          )
        )
      );
  }

  descartarPropuesta(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/cancelar_resultado_manual/`)
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al descartar la propuesta de asignación.',
            false
          )
        )
      );
  }

  obtenerGruposLogisticos(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/obtener_grupos/`)
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener los grupos logísticos.',
            false
          )
        )
      );
  }

  obtenerDiasLogisticos(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/obtener_dias_grupo/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener los días logísticos.',
            false
          )
        )
      );
  }
  capturarTuplaModificaciones(data : any) : Observable<any>{
    return this.http
    .post<any>(
      `${environment.baseURL}/tupla_modificaciones/`,
      data,
      httpConfig
    )
    .pipe(
      catchError(
        this.manejarError<any>(
          'Hubo un error al obtener la tupla del archivo modificaciones.',
          false
        )
      )
    );
  }
}
