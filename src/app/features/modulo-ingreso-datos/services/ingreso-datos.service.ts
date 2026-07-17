import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

const httpConfig = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class IngresoDatosService {

  constructor(private http: HttpClient) {}

  agregar_cliente_masivo_primera(): Observable<any> {
    return this.http.post(`${environment.baseURL}/agregar_cliente_masivo_primera/`,
    {withCredentials: true})
  }

  guardarDatos(): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}/agregar_datos/`);
  }

  existe_cliente(rut_cliente: any): Observable<any>{
    return this.http.post(`${environment.baseURL}/existe_cliente/`,rut_cliente,
    {withCredentials: true})
  }

  obtener_dias_logisticos(nota_venta: any): Observable<any>{
    return this.http.post(`${environment.baseURL}/obtener_dias_log`,nota_venta,
    {withCredentials: true})
  }
  
  existe_visita(ids_visita: any): Observable<any>{
    return this.http.post(`${environment.baseURL}/existe_visita/`,ids_visita,
    {withCredentials: true})
  }

  existe_servicio(ids_servicio: any): Observable<any>{
    return this.http.post(`${environment.baseURL}/existe_servicio/`,ids_servicio,
    {withCredentials: true})
  }

  agregar_cliente_manual(data: any): Observable<any>{
    return this.http.post(`${environment.baseURL}/agregar_cliente_manual/`,data,
    {withCredentials: true})
  }
}
