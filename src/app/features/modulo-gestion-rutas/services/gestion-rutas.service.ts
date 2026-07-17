import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, pipe } from 'rxjs';
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
export class GestionRutasService {
  constructor(
    private http: HttpClient,
    private servicioNotificaciones: NotificacionService
  ) {}

  private manejarError<T>(metodo = 'metodo', resultado?: T) {
    return (error: any): Observable<T> => {
      this.servicioNotificaciones.notificacionError(
        `HTTP Error ${error.status}. ${metodo}`
      );
      return of(resultado as T);
    };
  }

  obtenerSaturaciones(): Observable<any> {
    return this.http
      .get<any>(`${environment.baseURL}/obtener_saturaciones/`)
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener las saturaciones.',
            []
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

  obtenerRutaAsignacion(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/obtener_ruta_asignacion/`,
        datos,
        httpConfig
      )
      .pipe(catchError(this.manejarError<any>('obtenerRutaAsignacion', [])));
  }

  guardarGrupoLogistico(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/agregar_nuevos_grupos_logisticos/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>('Hubo un error al guardar el grupo logístico.')
        )
      );
  }

  obtenerServiciosNotaVenta(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/obtener_servicios_nv/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>('Hubo un error al obtener los servicios.', [])
        )
      );
  }

  eliminarServicio(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/eliminar_servicio2/`, datos, httpConfig)
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al eliminar el servicio.',
            false
          )
        )
      );
  }

  obtenerVisitasNotaVenta(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/obtener_visitas_nv/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>('Hubo un error al obtener las visitas.', [])
        )
      );
  }

  eliminarVisitas(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/eliminar_visitas_nv2/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al eliminar las visitas.',
            false
          )
        )
      );
  }

  obtenerVisitasNotaVentaDarDeBaja(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/info_nv/`, datos, httpConfig)
      .pipe(
        catchError(
          this.manejarError<any>('Hubo un error al obtener las visitas.', [])
        )
      );
  }

  edicionVisita(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/calculo_edicion/`, datos, httpConfig)
      .pipe(
        catchError(
          this.manejarError<any>('Hubo un error al editar la visita.', [])
        )
      );
  }

  guardarEdicion(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/guardar_edicion_mod3/`, datos, httpConfig)
      .pipe(
        catchError(
          this.manejarError<any>('Hubo un error al guardar la edicion', [])
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
            []
          )
        )
      );
  }

  obtenerDiasOperacion(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/obtener_dias_posibles_gl/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener los posibles días logísticos.',
            []
          )
        )
      );
  }

  guardarNuevosDiasOperacion(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/agregar_dias_operacion/`, datos)
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al guardar los nuevos días logísticos',
            false
          )
        )
      );
  }

  obtenerInformacionGrupoLogistico(datos: any): Observable<any> {
    return this.http
      .post<any>(
        `${environment.baseURL}/obtener_info_grupo/`,
        datos,
        httpConfig
      )
      .pipe(
        catchError(
          this.manejarError<any>(
            'Hubo un error al obtener la información del grupo logístico.',
            false
          )
        )
      );
  }

  guardarNuevoEjecutivo(datos: any): Observable<any> {
    return this.http
      .post<any>(`${environment.baseURL}/editar_ejecutivo/`, datos, httpConfig)
      .pipe(
        catchError(
          this.manejarError<any>('Hubo un error al editar el ejecutivo', false)
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
