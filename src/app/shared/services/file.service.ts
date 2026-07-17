import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  descargar_archivo_manual_usuario(): Observable<any>{
    return this.http.get(
      `${environment.baseURL}/enviar_archivo_manual/`,
      { responseType: 'blob' as 'json' }
    )
  }

  enviar_archivo(body: FormData): Observable<any> {
    return this.http.post(`${environment.baseURL}/enviar_archivo/`, body);
  }
  enviar_archivo_eliminar(body: FormData): Observable<any> {
    return this.http.post(
      `${environment.baseURL}/enviar_archivo_eliminar/`,
      body
    );
  }
  descargar_archivo_asignacion(): Observable<any> {
    return this.http.get(
      `${environment.baseURL}/descargar_archivo_asignacion/`,
      { responseType: 'blob' as 'json' }
    );
  }
  descargar_archivo_modificaciones(): Observable<any> {
    return this.http.get(
      `${environment.baseURL}/descargar_archivo_modificaciones/`,
      { responseType: 'blob' as 'json' }
    );
  }
  cancelar_archivos(): Observable<any> {
    return this.http.get(`${environment.baseURL}/cancelar_archivos/`);
  }
  agregar_clientes_nuevo_masivo(): Observable<any> {
    return this.http.get(
      `${environment.baseURL}/agregar_clientes_nuevos_masivo/`
    );
  }
  agregar_clientes_antiguo_masivo(): Observable<any> {
    return this.http.get(
      `${environment.baseURL}/agregar_clientes_antiguo_masivo/`
    );
  }
  buscar_servicios(): Observable<any> {
    return this.http.get(`${environment.baseURL}/buscar_servicios/`);
  }
  buscar_dir_mal_escritas(): Observable<any> {
    return this.http.get(`${environment.baseURL}/direcciones_mal_escritas/`);
  }
  corregir_direcciones(body: FormData): Observable<any> {
    return this.http.post(`${environment.baseURL}/corregir_direcciones/`, body);
  }
}
