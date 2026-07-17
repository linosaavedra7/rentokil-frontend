import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { GestionRutasService } from '../../services/gestion-rutas.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { diasLogisticos } from '../../../../shared/Constantes';

import { environment } from 'src/environments/environment';
import * as Mapboxgl from 'mapbox-gl';
import { MapboxService } from 'src/app/shared/services/mapbox.service';

@Component({
  selector: 'app-editar-ruta',
  templateUrl: './editar-ruta.component.html',
  styleUrls: ['./editar-ruta.component.css'],
})
export class EditarRutaComponent implements OnInit {
  listaNavegacion: string[] = ['3) Gestión de rutas', 'Editar ruta'];

  loading: boolean = false;
  mensaje = '';
  mensajeSpinner: string = '';

  mostrarInputNotaVenta: boolean = true;
  mostrarTablaVisitas: boolean = false;
  mostrarInfoRequerida: boolean = false;
  mostrarResultadoEdicion: boolean = false;
  mostrarTablaSaturaciones: boolean = false;
  mostrarContenedorDerecho: boolean = true;

  gruposLogisticos: any[] = [];
  listaDias: any[] = [];

  notaVenta?: number;

  info_visita = {
    rut_clie: '',
    nombre_clie: '',
    direccion_log: '',
    grupo_log: '',
    dias_visita: [],
  };

  formularioEdicionModelo = this.formBuilder.group({
    rut_clie: [{ value: '', disabled: true }],
    nombre_clie: [{ value: '', disabled: true }],
    direccion_log: [{ value: '', disabled: true }],
    grupo_log: [{ value: '', disabled: true }],
  });

  formularioEdicionVisita = this.formBuilder.group({
    grupo_log: ['', Validators.required],
    dia_asig: ['', Validators.required],
    dia_asig2: [''],
  });

  diasLogisticos = diasLogisticos;

  segundos_dias = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E',
  };

  resultadoEdicion: any[] = [];
  diasLogisticosEdicion: string[] = [];

  tablaResultado = [
    { rutero: '', dia_logistico: '', saturacion: 0, tiempo: 0 },
  ];

  listado_direcciones: any;
  listado_coordenadas: any[] = [];
  coordenadas = '';

  route: any;

  mapa!: Mapboxgl.Map;
  marker: any;
  token = environment.mapbox.accessToken;
  latitud_centro = -33.45694;
  longitud_centro = -70.64827;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private servicioGestionRutas: GestionRutasService,
    private servicioNotificacion: NotificacionService,
    private mapboxService: MapboxService
  ) {}

  ngOnInit(): void {
    this.obtenerGruposLogisticos();
  }

  retornarCero(): number {
    return 0;
  }

  obtenerGruposLogisticos(): void {
    this.servicioGestionRutas.obtenerGruposLogisticos().subscribe((resp) => {
      if (!resp) return;
      this.gruposLogisticos = resp.map((dato: any) => {
        return dato.grupo;
      });
    });
  }

  obtenerDias(event: any): void {
    let grupo = event.source.value;
    this.listaDias.length = 0;
    let cantidadVisitas = this.info_visita.dias_visita.length;
    console.log(grupo);

    const datos = {
      grupo_log: grupo,
    };
    this.servicioGestionRutas.obtenerDiasLogisticos(datos).subscribe((resp) => {
      if (!resp) return;
      let listaDias = [];
      listaDias = resp.map((dato: any) => {
        return dato.dia;
      });
      switch (cantidadVisitas) {
        case 1:
          this.listaDias = listaDias;
          break;
        case 2:
          this.listaDias = listaDias.filter(
            (dia: string) => dia.includes('2') || dia.includes('3')
          );
          break;
        case 4:
          this.listaDias = listaDias.filter((dia: string) => dia.includes('2'));
          break;
        case 8:
          this.listaDias = listaDias.filter((dia: string) => dia.includes('2'));
          break;
        case 12:
          this.listaDias = listaDias.filter((dia: string) =>
            dia.includes('A2')
          );
          break;

        default:
          break;
      }
    });
  }

  obtenerVisitasNotaVenta(): void {
    const datos = {
      nv: this.notaVenta,
    };
    this.servicioGestionRutas
      .obtenerVisitasNotaVentaDarDeBaja(datos)
      .subscribe((resp) => {
        if (resp.length == 0) {
          this.info_visita = resp;
          this.servicioNotificacion.notificacionError(
            'No se encontraron visitas para esa nota de venta.'
          );
          return;
        }

        this.info_visita = resp;

        this.gruposLogisticos = this.gruposLogisticos.filter(
          (grupo: string) => grupo != this.info_visita.grupo_log
        );

        this.formularioEdicionModelo.patchValue({
          rut_clie: this.info_visita['rut_clie'],
          nombre_clie: this.info_visita['nombre_clie'],
          direccion_log: this.info_visita.direccion_log,
          grupo_log: this.info_visita.grupo_log,
        });

        this.mostrarTablaVisitas = true;
      });
  }
  editar_visita() {
    this.mostrarInputNotaVenta = false;
    this.mostrarTablaVisitas = false;
    this.mostrarInfoRequerida = true;
  }

  redireccionarRevisarRutas() {}

  generar_edicion_visita() {
    this.mostrarContenedorDerecho = true;
    this.loading = true;
    this.mensaje = 'Calculando edicion visita';
    let { grupo_log, dia_asig, dia_asig2 } = this.formularioEdicionVisita.value;

    if (this.info_visita.dias_visita.length != 8) {
      dia_asig2 = 'N/A';
    }

    const datos = {
      nv: this.notaVenta,
      grupo_log: grupo_log,
      dia_asig: dia_asig,
      dia_asig2: dia_asig2,
    };

    this.servicioGestionRutas.edicionVisita(datos).subscribe((resp) => {
      if (resp.length == 0) {
        this.servicioNotificacion.notificacionError(
          'No se encontraron visitas para esa nota de venta.'
        );
        this.loading = false;
        return;
      }
      this.resultadoEdicion = resp;

      if (this.resultadoEdicion[0].saturacion.length == 0) {
        let mensaje = '';
        mensaje += 'La nota de venta ' + this.notaVenta;
        mensaje += ' no puede ser asignada al grupo ' + grupo_log;
        mensaje +=
          ' debido a que el dia ' + this.resultadoEdicion[0].dia_logistico;
        mensaje += ' no está en operación.';
        this.loading = false;
        this.servicioNotificacion.notificacionError(mensaje);
      } else {
        for (let i = 0; i < this.resultadoEdicion.length; i++) {
          this.diasLogisticosEdicion[i] =
            this.resultadoEdicion[i].dia_logistico;
        }
        this.loading = false;
        this.mostrarResultadoEdicion = true;
        this.mostrar_mapa();
        this.resultado_edicion(this.diasLogisticosEdicion[0]);
      }
    });
  }

  resultado_edicion(dia_log: string) {
    const mapa = document.getElementById('mapa') as HTMLElement;
    mapa.style.visibility = 'visible';

    let color = '';

    for (let i = 0; i < this.resultadoEdicion.length; i++) {
      if (this.resultadoEdicion[i].dia_logistico == dia_log) {
        this.tablaResultado[0].rutero =
          this.resultadoEdicion[i].grupo_logistico;
        this.tablaResultado[0].dia_logistico =
          this.resultadoEdicion[i].dia_logistico;
        this.tablaResultado[0].saturacion =
          this.resultadoEdicion[i].saturacion.toFixed(2);
        this.tablaResultado[0].tiempo =
          this.resultadoEdicion[i].tiempo_total.toFixed(2);

        this.listado_direcciones = this.resultadoEdicion[i].ruta_recorrido;
        this.coordenadas = this.resultadoEdicion[i].lat_long;

        let saturacion = Math.round(this.resultadoEdicion[i].saturacion);

        if (saturacion > 0 && saturacion <= 40) color = 'grey';
        if (saturacion > 40 && saturacion < 75) color = 'green';
        if (saturacion >= 75 && saturacion < 85) color = 'yellow';
        if (saturacion >= 85) color = 'red';

        this.obtener_ruta(
          dia_log,
          this.coordenadas,
          this.listado_direcciones,
          color
        );
      }
    }
  }

  guardar_edicion() {
    this.loading = true;
    this.mensaje = 'Guardando edicion...\n(Esto puede tardar unos minutos)';

    const data = {
      nv: this.notaVenta,
      horario_perm: '08:00;19:00',
      dia_perm: 'L, M, I, J, V',
    };

    this.servicioGestionRutas.guardarEdicion(data).subscribe(
      (data) => {
        if (!data) {
          this.loading = false;
          return;
        }
        this.loading = false;
        for(let i = 0 ; i < this.diasLogisticosEdicion.length ; i++){
          const datosMod = {
            notaVenta : this.notaVenta,
            diaLog: this.diasLogisticosEdicion[i],
            tipo:'modificacion'
          }
          this.servicioGestionRutas.capturarTuplaModificaciones(datosMod).subscribe(
            (data) => {
              console.log(data)
            },
            (error) => {
              console.log(error)
            }
          )
        }
        this.servicioNotificacion.notificacionExito(data);
      },
      (error) => {
        this.servicioNotificacion.notificacionError(
          `Hubo un error al guardar la propuesta de asignación. ${error}`
        );
        this.loading = false;
        this.refrescarPagina();
      }
    );
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
  }

  /*Se dibujan las lineas entre el listado de coordenadas en el mapa*/
  dibujar_ruta(
    ruta_id: string,
    route: any,
    color: string,
    coordenadas: string,
    list_direcciones: string[]
  ) {
    const boton = document.getElementById(ruta_id) as HTMLElement;
    boton.style.backgroundColor = color;

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
      const boton = document.getElementById(id_route) as HTMLElement;
      boton.style.backgroundColor = '#0076c4';
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

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/gestion-de-rutas/editar-ruta']);
    });
  }

  volver(): void {
    this.mostrarInfoRequerida = false;
    this.mostrarInputNotaVenta = true;
    this.mostrarContenedorDerecho = false;
    this.mostrarResultadoEdicion = false;
  }
}
