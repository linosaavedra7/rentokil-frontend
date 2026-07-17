import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { GestionRutasService } from '../../services/gestion-rutas.service';
import { diasLogisticos } from '../../../../shared/Constantes';
import { SelectionModel } from '@angular/cdk/collections';

import { environment } from 'src/environments/environment';
import * as Mapboxgl from 'mapbox-gl';
import { MapboxService } from 'src/app/shared/services/mapbox.service';

@Component({
  selector: 'app-revisar-ruta',
  templateUrl: './revisar-ruta.component.html',
  styleUrls: ['./revisar-ruta.component.css'],
})
export class RevisarRutaComponent implements OnInit {
  listaNavegacion: string[] = ['3) Gestión de rutas', 'Revisar rutas'];
  columnasTablaGruposLogisticos: string[] = [
    'select',
    'grupo_log',
    'zona',
    'saturacion',
  ];

  listaDiasLogisticos = diasLogisticos;
  listaSaturaciones: any[] = [];
  listaGruposLogisticos: any[] = [];
  seleccionGruposLogisticos = new SelectionModel<any>(true, []);

  mostrarGruposLogisticos: boolean = false;
  mostrarSeccionRuta: boolean = false;
  loading: boolean = false;

  diaLogistico: string = '';

  resultado = [{ rutero: '', dia_logistico: '', saturacion: 0, tiempo: 0 }];

  listado_direcciones: string[] = [];
  listado_coordenadas: any[] = [];
  coordenadas: any;

  route: any;

  mapa!: Mapboxgl.Map;
  marker: any;
  token = environment.mapbox.accessToken;
  latitud_centro = -33.45694;
  longitud_centro = -70.64827;

  constructor(
    private servicioGestionRutas: GestionRutasService,
    private mapboxService: MapboxService
  ) {}

  ngOnInit(): void {
    this.obtenerSaturaciones();
    this.mostrar_mapa();
  }

  retornarCero(): number {
    return 0;
  }

  obtenerSaturaciones(): void {
    this.servicioGestionRutas.obtenerSaturaciones().subscribe((resp) => {
      if (resp.length == 0) return;
      this.listaSaturaciones = resp.filter((dato: any) => dato.saturacion > 0);
    });
  }

  obtenerGruposLogisticos(event: any): void {
    this.diaLogistico = event.source.value;

    this.listaGruposLogisticos = this.listaSaturaciones.filter(
      (grupo) => grupo.dia_log == this.diaLogistico
    );

    this.listaGruposLogisticos.sort((a, b) => {
      let keyA = a.grupo_log;
      let keyB = b.grupo_log;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });

    if (this.listaGruposLogisticos.length !== 0) {
      this.mostrarGruposLogisticos = true;
    } else {
      this.mostrarGruposLogisticos = false;
    }
  }

  obtenerGruposLogisticosSeleccionados(row: any): void {

    const mapa = document.getElementById('mapa') as HTMLElement;
    mapa.style.visibility = 'visible';
    let color = '';
    let ruta_id = row.grupo_log + this.diaLogistico;
    let saturacion = Math.round(row.saturacion);

    if (this.seleccionGruposLogisticos.selected.length != 0) {
      this.mostrarSeccionRuta = true;
      if (saturacion > 0 && saturacion <= 40) color = 'grey';
      if (saturacion > 40 && saturacion <= 75) color = 'green';
      if (saturacion > 75 && saturacion <= 85) color = 'yellow';
      if (saturacion > 85 ) color = 'red';
      console.log(saturacion)
      console.log(color)
      const datos = {
        grupo_logistico: row.grupo_log,
        dia_logistico: this.diaLogistico,
      };
      this.servicioGestionRutas.obtenerRutaAsignacion(datos).subscribe(
        (data) => {
          this.listado_direcciones = data['ruta'];
          this.coordenadas = data['coordenadas'];

          if (this.seleccionGruposLogisticos.isSelected(row)) {
            this.resultado[0].rutero = row.grupo_log;
            this.resultado[0].dia_logistico = this.diaLogistico;
            this.resultado[0].saturacion = data['saturacion'].toFixed(2);
            this.resultado[0].tiempo = data['tiempo'].toFixed(2);
            //link_mapa = data['link_mapa']
          }
          this.obtener_ruta(
            ruta_id,
            this.coordenadas,
            this.listado_direcciones,
            color
          );
        },
        (error) => {
          console.log(error);
        }
      );
    } 
    else {
      this.mostrarSeccionRuta = false;

      if(this.mapa.getLayer(ruta_id)){
        this.ocultar_ruta(ruta_id, this.listado_direcciones);
      }
      const marcador = document.getElementById('marker' + ruta_id) as HTMLElement;
      if(marcador){
        marcador.style.visibility = 'hidden';
      }
      mapa.style.visibility = 'hidden';
      var bounds = new Mapboxgl.LngLatBounds();
      bounds.extend([this.longitud_centro, this.latitud_centro]);
      this.mapa.fitBounds(bounds, { maxZoom: 10 });
    }
  }

  mostrar_mapa() {
    this.mapa = new Mapboxgl.Map({
      accessToken: this.token,
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitud_centro, this.latitud_centro],
      zoom: 10,
    });
    this.mapa.addControl(new Mapboxgl.FullscreenControl());
  }

  obtener_ruta(
    id_route: string,
    coordenadas: string,
    list_direcciones: string[],
    color: string
  ) {
    if (list_direcciones.length != 1) {
      /*Se obtienen las coordenadas*/
      const coords = coordenadas.split('/');
      this.listado_coordenadas = [];
      for (let i = 0; i < coords.length; i++) {
        const lat_long = coords[i].split(',');
        this.listado_coordenadas[i] = [lat_long[1], lat_long[0]];
      }
      /*Se obtiene informacion de la ruta para las coordenadas*/
      this.mapboxService
        .obtener_coordenadas(this.listado_coordenadas)
        .subscribe((res: any) => {
          /* Listado de todas las coordenadas existente entre los puntos del listado de coordenda */
          var data = res.routes[0];
          this.route = data.geometry.coordinates;
          this.dibujar_ruta(
            id_route,
            this.route,
            color,
            coordenadas,
            list_direcciones
          );
        });
    } else {
      const marcador = document.getElementById('marker' + id_route) as HTMLElement;
      if (!marcador) {
        const lat_long = coordenadas.split(',');
        var longitud: number = +lat_long[1];
        var latitud: number = +lat_long[0];

        /*Popup con la informacion de la direccion por cada marcador*/
        const popup = new Mapboxgl.Popup({ offset: 25 }).setText(
          list_direcciones[0]
        );

        /*Se dibuja un marcador por cada coordenada encontrada*/
        this.marker = new Mapboxgl.Marker({ color: color })
          .setLngLat([longitud, latitud])
          .setPopup(popup)
          .addTo(this.mapa);
        this.marker._element.id = 'marker' + id_route;

        this.mapa.flyTo({
          center: [longitud, latitud],
          zoom: 12,
        });

        this.marker._element.style.visibility = 'visible';
        
      } else {
        const lat_long = coordenadas.split(',');
        var longitud: number = +lat_long[1];
        var latitud: number = +lat_long[0];
        let visible = marcador.style.visibility;
        if (visible == 'visible') {
          console.log('se oculta el marcador')
          marcador.style.visibility = 'hidden';
          this.mapa.flyTo({
            center: [this.longitud_centro, this.latitud_centro],
            zoom: 10,
          });
        } else {
          marcador.style.visibility = 'visible';
          this.mapa.flyTo({
            center: [longitud, latitud],
            zoom: 12,
          });
        }
      }
    }
  }
  
  
  //{
    /*Se obtienen las coordenadas*/
    /***const coords = coordenadas.split('/');
    this.listado_coordenadas = [];
    for (let i = 0; i < coords.length; i++) {
      const lat_long = coords[i].split(',');
      this.listado_coordenadas[i] = [lat_long[1], lat_long[0]];
    }
    /*Se obtiene informacion de la ruta para las coordenadas*/
    /*this.mapboxService
      .obtener_coordenadas(this.listado_coordenadas)
      .subscribe((res: any) => {
        /* Listado de todas las coordenadas existente entre los puntos del listado de coordenda */
        /*var data = res.routes[0];
        this.route = data.geometry.coordinates;
        this.dibujar_ruta(
          id_route,
          this.route,
          color,
          coordenadas,
          list_direcciones
        );
      });
  }*/

  /*Se dibujan las lineas entre el listado de coordenadas en el mapa*/
  dibujar_ruta(
    ruta_id: string,
    route: any,
    color: string,
    coordenadas: string,
    list_direcciones: string[]
  ) {
    /*Si no existen capas se dibuja la ruta y los marcadores*/
    if (!this.mapa.getLayer(ruta_id) || !this.mapa.getSource(ruta_id)) {
      this.mapa.addSource(ruta_id, {
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
        id: ruta_id,
        type: 'line',
        source: ruta_id,
        layout: {
          visibility: 'visible',
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': 5,
        },
      });

      /*Se ordena y obtienen las coordenadas para aplicar marcadores*/
      const coords = coordenadas.split('/');
      for (let i = 0; i < coords.length; i++) {
        const lat_long = coords[i].split(',');
        var longitud: number = +lat_long[1];
        var latitud: number = +lat_long[0];

        /*Popup con la informacion de la direccion por cada marcador*/
        const popup = new Mapboxgl.Popup({ offset: 25 }).setText(
          list_direcciones[i]
        );

        /*Se dibuja un marcador por cada coordenada encontrada*/
        this.marker = new Mapboxgl.Marker({ color: color })
          .setLngLat([longitud, latitud])
          .setPopup(popup)
          .addTo(this.mapa);
        this.marker._element.id = 'marker' + ruta_id + i;
      }

      /*Margen al mostrar el resultado de las rutas en el mapa*/
      this.mapa.fitBounds([route[0], route[route.length - 1]], {
        padding: { top: 80, bottom: 50, left: 50, right: 50 },
      });
    } else {
      /*Si existen capas se procede a ocultar la ruta*/
      this.ocultar_ruta(ruta_id, list_direcciones);
    }
  }

  ocultar_ruta(id_route: string, list_direcciones: string[]) {
    /*Se captura la visibilidad de las capas*/
    let visibility = this.mapa.getLayoutProperty(id_route, 'visibility');
    if (visibility == 'visible') {
      /*Si la capa es visible esta se oculta*/
      this.mapa.setLayoutProperty(id_route, 'visibility', 'none');
      /*Si la capa es visible, se oculta cada marcador de la ruta*/
      for (let i = 0; i <= list_direcciones.length; i++) {
        let marker_id = 'marker' + id_route + i;
        let marker = document.getElementById(marker_id);
        marker?.setAttribute('style', 'display : none;');
      }
    } else {
      /*Si la capa esta oculta se hace visible*/
      this.mapa.setLayoutProperty(id_route, 'visibility', 'visible');
      /*Si la capa esta oculta, se hace visible cada marcador de la ruta */
      for (let i = 0; i <= list_direcciones.length; i++) {
        let marker_id = 'marker' + id_route + i;
        let marker = document.getElementById(marker_id);
        marker?.setAttribute('style', 'display : flex;');
      }

      /*Margen al mostrar el resultado de las rutas en el mapa*/
      this.mapa.fitBounds([this.route[0], this.route[this.route.length - 1]], {
        padding: { top: 80, bottom: 50, left: 50, right: 50 },
      });
    }
  }
}

//https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
