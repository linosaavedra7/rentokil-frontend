import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

export interface MapboxOutput {
  attribution: string;
  features: Feature[];
  query: [];
}

export interface Feature {
  place_name: string;
  center:any;
}

@Injectable({
  providedIn: 'root'
})
export class MapboxService {

  constructor(private http: HttpClient) { }

  /*Servicio para el autocompletado de las direcciones en un input*/
  search_word(query: string) {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    return this.http.get(url + query + '.json?country=CL&access_token='
    + environment.mapbox.accessToken).pipe(
      map((res: any)  => {
        return res.features
      })
    )
  }
  
  /*Servicio para el listado de coordenadas para dibujar una ruta en el mapa*/
  obtener_coordenadas(coords : any) {

    var listado_coordenadas : any = '';

    for(let i = 0 ; i < coords.length ; i++){
      listado_coordenadas += `${coords[i][0]},${coords[i][1]};`
    }
    listado_coordenadas = listado_coordenadas.substr(0, listado_coordenadas.length - 1);
    const url = [
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/`,listado_coordenadas,
      `?steps=true&geometries=geojson&access_token=${environment.mapbox.accessToken}`,
    ].join('');

    return this.http.get(url)

  }

}