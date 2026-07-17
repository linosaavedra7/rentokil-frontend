import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
export class AsignacionClientesService {
  constructor(
    private http: HttpClient,
    private servicioNotificaciones: NotificacionService
  ) {}

  private manejarError<T>(metodo = 'metodo', resultado?: T) {
    return (error: any): Observable<T> => {
      this.servicioNotificaciones.notificacionError(
        `${metodo} falló: ${error.message}`
      );
      return of(resultado as T);
    };
  }

  obtenerNotasVentaNuevas(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/nv_nuevas/`)
      .pipe(catchError(this.manejarError<any>('obtenerNotasVentaNuevas', [])));
  }

  obtenerZonaCliente(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/obtener_zona_cliente/`,
        datos,
        httpConfig
      )
      .pipe(catchError(this.manejarError<any>('obtenerZonaCliente', 'N/A')));
  }

  obtenerSaturaciones(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/obtener_saturaciones/`)
      .pipe(catchError(this.manejarError<any>('obtenerSaturaciones', [])));
  }

  obtenerDatosFaltantes(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/datos_faltantes_modelo2/`,
        datos,
        httpConfig
      )
      .pipe(catchError(this.manejarError<any>('obtenerDatosFaltantes', [])));
  }

  generarPropuesta(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/modelo_mat_opt2/`, datos, httpConfig)
      .pipe(catchError(this.manejarError<any>('generarPropuesta', [])));
  }

  guardarPropuesta(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/guardar_resultado_modelo/`,
        datos,
        httpConfig
      )
      .pipe(catchError(this.manejarError<any>('guardarPropuesta', false)));
  }

  generarPropuestaEditada(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/modelo_mat_opt2_ed/`,
        datos,
        httpConfig
      )
      .pipe(catchError(this.manejarError<any>('generarPropuestaEditada', [])));
  }

  generarPropuestaManual(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/manual_opt_ed/`, datos, httpConfig)
      .pipe(catchError(this.manejarError<any>('generarPropuestaManual', [])));
  }

  guardarPrimerResultadoAsignacion(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/guardar_resultado_1_ed_modelo/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>('guardarPrimerResultadoAsignacion', false)
        )
      );
  }

  guardarSegundoResultadoAsignacion(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/guardar_resultado_2_ed_modelo/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>('guardarSegundoResultadoAsignacion', false)
        )
      );
  }

  descartarResultadoAsignacion(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/cancelar_resultado_modelo/`)
      .pipe(
        catchError(
          this.manejarError<any>('descartarResultadoAsignacion', false)
        )
      );
  }

  cancelarResultadosAsignacion(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/cancelar_resultado_modelo_ed/`)
      .pipe(
        catchError(
          this.manejarError<any>('cancelarResultadosAsignacion', false)
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

  capturarTuplaModificaciones(data: any): Observable<any> {
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
