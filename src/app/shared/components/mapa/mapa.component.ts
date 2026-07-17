import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as Mapboxgl from 'mapbox-gl';
import { MapboxService } from 'src/app/shared/services/mapbox.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css'],
})
export class MapaComponent implements OnInit {
  @Input() listado_direcciones: any;
  @Input() coordenadas = '';

  listado_coordenadas: any[] = [];

  mapa!: Mapboxgl.Map;

  token = environment.mapbox.accessToken;

  latitud_centro = -33.45694;
  longitud_centro = -70.64827;

  constructor(private mapboxService: MapboxService) {}

  ngOnInit(): void {
    this.mostrar_mapa();
  }

  mostrar_mapa() {
    this.mapa = new Mapboxgl.Map({
      accessToken: this.token,
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitud_centro, this.latitud_centro],
      zoom: 10,
    });
    this.dibujar_ruta();
  }

  dibujar_ruta() {
    /*Se obtienen las coordenadas y se dibujan marcadores */
    const coords = this.coordenadas.split('/');

    for (let i = 0; i < coords.length; i++) {
      /*Se obtienen las coordenadas enviadas por el modelo matematico*/
      const lat_long = coords[i].split(',');
      this.listado_coordenadas[i] = [lat_long[1], lat_long[0]];
      var longitud: number = +lat_long[1];
      var latitud: number = +lat_long[0];

      /*Popup con la informacion de la direccion por cada marcador*/
      const popup = new Mapboxgl.Popup({ offset: 25 }).setText(
        this.listado_direcciones[i]
      );
      const el = document.createElement('div');
      el.id = 'marker';

      /*Se dibuja un marcador por cada coordenada encontrada*/
      new Mapboxgl.Marker({'color' : 'blue'})
        .setLngLat([longitud, latitud])
        .setPopup(popup)
        .addTo(this.mapa);
    }

    var data;
    var distancia;
    var tiempo;
    var route: any;

    this.mapboxService
      .obtener_coordenadas(this.listado_coordenadas)
      .subscribe((res: any) => {
        /* Captura de informacion del servicio Mapbox-gl-directions */
        /* Listado de todas las coordenadas existente entre los puntos del listado de coordenda */
        data = res.routes[0];
        distancia = data.distance / 1000; //Distancia entre los dos puntos en KM
        //console.log(distancia + ' KM')
        tiempo = data.duration / 60; //Tiempo de la ruta en minutos
        //console.log(tiempo + ' min')

        route = data.geometry.coordinates;

        /*Se dibujan las lineas entre el listado de coordenadas en el mapa*/
        this.mapa.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route,
            },
          },
        });
        this.mapa.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': 'blue',
            'line-width': 5,
          },
        });

        /*Margen o Bordes al mostrar el resultado de las rutas en el mapa*/
        this.mapa.fitBounds([route[0], route[route.length - 1]], {
          padding: { top: 80, bottom: 50, left: 50, right: 50 },
        });

        /* Recuadro en el mapa con la informacion de la distancia entre las coordenadas */
        const info_distancia = document.getElementById('distancia') as HTMLElement
        info_distancia.textContent = distancia.toFixed(2).toString() + ' KM';

        /* Recuadro en el mapa con informacion del tiempo de recorrido entre las coordenadas */
        const info_tiempo = document.getElementById('tiempo') as HTMLElement
        info_tiempo.textContent = Math.round(tiempo).toString() + ' min';
        
      });
  }
  /*
  https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-directions
  https://docs.mapbox.com/api/navigation/directions/#retrieve-directions
  https://www.npmjs.com/package/@mapbox/mapbox-gl-directions 
  */
}
