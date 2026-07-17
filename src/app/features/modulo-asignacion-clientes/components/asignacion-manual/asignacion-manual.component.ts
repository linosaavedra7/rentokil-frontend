import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AsignacionClientesManualService } from '../../services/asignacion-clientes-manual.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { diasLogisticos } from '../../../../shared/Constantes';

import { environment } from 'src/environments/environment';
import * as Mapboxgl from 'mapbox-gl';
import { MapboxService } from 'src/app/shared/services/mapbox.service';

interface Cliente {
  rut: string;
  nombre: string;
  notaVenta: number;
  visitas: number;
}

@Component({
  selector: 'app-asignacion-manual',
  templateUrl: './asignacion-manual.component.html',
  styleUrls: ['./asignacion-manual.component.css'],
})
export class AsignacionManualComponent implements OnInit {
  listaNavegacion: string[] = [
    '2) Asignación de Clientes',
    'Asignación manual',
  ];
  listaClientes = [];
  listaServicios: any[] = [];
  columnasTablaClientes: string[] = [
    'select',
    'rut',
    'nombre',
    'nota_venta',
    'visitas',
  ];
  letrasDiasLogisticos: any = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E',
  };
  diasLogisticos = diasLogisticos;
  listaDias: any[] = [];
  gruposLogisticos: any[] = [];

  formularioAsignacionManual = this.formBuilder.group({
    notaVenta: ['', Validators.required],
    grupoLogistico: ['', Validators.required],
    primerDiaLogistico: ['', Validators.required],
    segundoDiaLogistico: [''],
    servicios: [[], Validators.required],
  });

  clienteSeleccionado: Cliente = {
    rut: '',
    nombre: '',
    notaVenta: -1,
    visitas: -1,
  };

  notaDeVentaClienteSeleccionado!: number;
  permitirSeleccionMultiple: boolean = false;
  seleccionCliente = new SelectionModel<any>(this.permitirSeleccionMultiple);
  restricciones: any[] = [];
  resultadoPropuesta: any[] = [];
  informacionPropuestaAceptada: any[] = [];

  cantidadVisitas?: number;
  tieneOchoVisitas: boolean = false;
  mostrarSeccionClientes: boolean = true;
  mostrarTablaClientes: boolean = true;
  mostrarFormulario: boolean = false;
  mostrarTablaSaturaciones: boolean = false;
  mostrarConfirmacionPropuesta: boolean = false;
  mostrarResultadoPropuesta: boolean = false;
  mostrarInformacionPropuestaAceptada: boolean = false;
  mensajeSpinner: string = '';
  loading: boolean = false;

  dias_logisticos_cliente: string[] = [];

  listado_direcciones: any;
  listado_coordenadas: any[] = [];
  coordenadas = '';

  route: any;

  mapa!: Mapboxgl.Map;
  marker: any;
  token = environment.mapbox.accessToken;
  latitud_centro = -33.45694;
  longitud_centro = -70.64827;

  //dias_logisticos_cliente : string[] = ['A1','A2','A3','A4']
  resultado = [{ rutero: '', dia_logistico: '', saturacion: 0, tiempo: 0 }];

  linkMapa: string = '';
  esAsignacionManual: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private servicioAsignacionManual: AsignacionClientesManualService,
    private servicioNotificaciones: NotificacionService,
    private router: Router,
    private mapboxService: MapboxService
  ) {}

  ngOnInit(): void {
    this.obtenerNotasDeVenta();
    this.obtenerGruposLogisticos();
  }

  retornarCero(): number {
    return 0;
  }

  obtenerNotasDeVenta(): void {
    this.mensajeSpinner = 'Cargando clientes nuevos...';
    this.loading = true;
    this.mostrarTablaClientes = false;
    this.servicioAsignacionManual.obtenerNotasDeVentaNuevas().subscribe({
      next: (resp) => {
        this.listaClientes = resp;
        this.loading = false;
        this.mostrarTablaClientes = true;
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(
          `Hubo un error. ${error}`
        );
        this.loading = false;
        this.mostrarTablaClientes = true;
      },
    });
  }

  obtenerClienteSeleccionado(): void {
    this.formularioAsignacionManual.reset();
    this.listaDias.length = 0;
    try {
      this.mostrarFormulario = false;
      this.notaDeVentaClienteSeleccionado =
        this.seleccionCliente.selected[0].nota_venta;

      this.clienteSeleccionado = this.seleccionCliente.selected[0];

      this.formularioAsignacionManual.patchValue({
        notaVenta: this.notaDeVentaClienteSeleccionado,
      });

      this.obtenerServicios(this.notaDeVentaClienteSeleccionado);
      this.obtenerRestriccionCliente();
    } catch (error) {
      this.formularioAsignacionManual.patchValue({
        notaVenta: '',
      });
      this.clienteSeleccionado = {
        rut: '',
        nombre: '',
        notaVenta: -1,
        visitas: -1,
      };
      this.mostrarFormulario = false;
    }
  }

  obtenerServicios(notaDeVenta: number): void {
    this.mensajeSpinner = 'Cargando servicios del cliente...';
    this.loading = true;
    const datos = {
      nv: notaDeVenta,
    };
    this.servicioAsignacionManual.obtenerServicios(datos).subscribe({
      next: (resp) => {
        if (resp.length == 0) return;
        this.listaServicios = resp;
        let idServicios: number[] = [];
        this.listaServicios.forEach((servicio) => {
          idServicios.push(servicio.id);
        });

        this.formularioAsignacionManual.patchValue({
          servicios: idServicios,
        });

        this.loading = false;
        this.mostrarFormulario = true;
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(
          `Hubo un error: ${error.message}`
        );
        this.loading = false;
      },
    });
  }

  obtenerRestriccionCliente(): void {
    const datos = {
      nv: this.notaDeVentaClienteSeleccionado,
    };

    this.servicioAsignacionManual.obtenerRestriccion(datos).subscribe({
      next: (resp) => {
        if (!resp) return;
        if (resp.length == 0) {
          this.restricciones = ['08:00;18:00', 'L, M, I, J, V'];
          console.log(this.restricciones);
          return;
        }
        this.restricciones = resp;
        console.log(this.restricciones);
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(error);
      },
    });
  }

  generarPropuesta(): void {
    this.mostrarSeccionClientes = false;
    this.mostrarFormulario = false;
    this.mostrarTablaClientes = false;
    this.mensajeSpinner = 'Generando propuesta de asignación...';
    this.loading = true;
    const {
      notaVenta,
      grupoLogistico,
      primerDiaLogistico,
      segundoDiaLogistico,
      servicios,
    } = this.formularioAsignacionManual.value;

    let segundoDia =
      this.clienteSeleccionado.visitas == 8 ? segundoDiaLogistico : 'n/a';

    const datos = {
      nv: notaVenta,
      grupo_log: grupoLogistico.toUpperCase(),
      dia_asig: primerDiaLogistico,
      dia_asig2: segundoDia,
      lista_indices: servicios,
    };

    this.servicioAsignacionManual.generarPropuesta(datos).subscribe({
      next: (resp) => {
        if (resp == false) {
          this.refrescarPagina();
        }
        this.loading = false;
        this.mostrarResultadoPropuesta = true;
        this.resultadoPropuesta = resp;
        this.informacionPropuestaAceptada = resp;
        if (this.resultadoPropuesta[0].saturacion.length == 0) {
          let mensaje = '';
          mensaje += 'La nota de venta ' + notaVenta;
          mensaje += ' no puede ser asignada al grupo ' + grupoLogistico;
          mensaje += ' debido a que el dia ' + this.resultadoPropuesta[0].dia_logistico;
          mensaje += ' no está en operación.';
          this.servicioNotificaciones.notificacionError(mensaje);
          this.mostrarSeccionClientes = true;
          this.mostrarTablaClientes = true;
          this.mostrarFormulario = true;
          this.loading = false;
        } else {
          for (let i = 0; i < this.resultadoPropuesta.length; i++) {
            this.dias_logisticos_cliente[i] =
              this.resultadoPropuesta[i].dia_logistico;
          }
          this.mostrarConfirmacionPropuesta = true;
          this.mostrar_mapa();
          this.resultado_asignacion(this.dias_logisticos_cliente[0]);
        }
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(error);
        this.mostrarResultadoPropuesta = false;
        this.mostrarSeccionClientes = true;
        this.loading = false;
      },
    });
  }

  resultado_asignacion(dia_log: string) {

    const mapa = document.getElementById('mapa') as HTMLElement;
    mapa.style.visibility = 'visible';

    let color = '';

    for (let i = 0; i < this.resultadoPropuesta.length; i++) {
      if (this.resultadoPropuesta[i].dia_logistico == dia_log) {
        this.resultado[0].rutero = this.resultadoPropuesta[i].grupo_logistico;
        this.resultado[0].dia_logistico =
          this.resultadoPropuesta[i].dia_logistico;
        this.resultado[0].saturacion =
          this.resultadoPropuesta[i].saturacion.toFixed(2);
        this.resultado[0].tiempo =
          this.resultadoPropuesta[i].tiempo_total.toFixed(2);
        this.linkMapa = this.resultadoPropuesta[i].link_mapa;

        console.log(this.linkMapa);

        this.listado_direcciones = this.resultadoPropuesta[i].ruta_recorrido;
        this.coordenadas = this.resultadoPropuesta[i].lat_long;

        let saturacion = Math.round(this.resultadoPropuesta[i].saturacion);

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
      const marcador = document.getElementById(
        'marker' + id_route
      ) as HTMLElement;
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
        setTimeout(() => {
          const boton = document.getElementById(id_route) as HTMLElement;
          boton.style.backgroundColor = color;
        }, 50);
      } else {
        const boton = document.getElementById(id_route) as HTMLElement;
        const lat_long = coordenadas.split(',');
        var longitud: number = +lat_long[1];
        var latitud: number = +lat_long[0];
        let visible = marcador.style.visibility;
        if (visible == 'visible') {
          boton.style.backgroundColor = '#0076c4';
          marcador.style.visibility = 'hidden';
          this.mapa.flyTo({
            center: [this.longitud_centro, this.latitud_centro],
            zoom: 10,
          });
        } else {
          boton.style.backgroundColor = color;
          marcador.style.visibility = 'visible';
          this.mapa.flyTo({
            center: [longitud, latitud],
            zoom: 12,
          });
        }
      }
    }
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

  guardarPropuesta(): void {
    this.mensajeSpinner =
      'Guardando propuesta de asignación...\n(Esto puede tardar unos minutos)';
    this.loading = true;
    const datos = {
      nv: this.notaDeVentaClienteSeleccionado,
      horario_perm: this.restricciones[0],
      dia_perm: this.restricciones[1],
    };

    this.servicioAsignacionManual.guardarPropuesta(datos).subscribe((resp) => {
      if (!resp) this.refrescarPagina();
      this.loading = false;
      this.servicioNotificaciones.notificacionExito(resp);
      for(let i = 0 ; i < this.dias_logisticos_cliente.length ; i++){
        const datosMod = {
          notaVenta : this.notaDeVentaClienteSeleccionado,
          diaLog: this.dias_logisticos_cliente[i],
          tipo:'asignacion'
        }
        this.servicioAsignacionManual.capturarTuplaModificaciones(datosMod).subscribe(
          (data) => {
            console.log(data)
          },
          (error) => {
            console.log(error)
          }
        )
      }
      this.mostrarConfirmacionPropuesta = false;
      this.mostrarInformacionPropuestaAceptada = true;
    });
  }

  descartarPropuesta(): void {
    this.servicioAsignacionManual.descartarPropuesta().subscribe((resp) => {
      if (!resp) this.refrescarPagina();
      this.servicioNotificaciones.notificacionExito(resp);
      this.refrescarPagina();
    });
  }

  obtenerGruposLogisticos(): void {
    this.servicioAsignacionManual
      .obtenerGruposLogisticos()
      .subscribe((resp) => {
        if (!resp) return;
        this.gruposLogisticos = resp.map((dato: any) => {
          return dato.grupo;
        });
      });
  }

  obtenerDias(event: any): void {
    let grupo = event.source.value;
    this.listaDias.length = 0;
    let cantidadVisitas = this.clienteSeleccionado.visitas;

    const datos = {
      grupo_log: grupo,
    };
    this.servicioAsignacionManual
      .obtenerDiasLogisticos(datos)
      .subscribe((resp) => {
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
            this.listaDias = listaDias.filter((dia: string) =>
              dia.includes('2')
            );
            break;
          case 8:
            this.listaDias = listaDias.filter((dia: string) =>
              dia.includes('2')
            );
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

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/asignacion-de-clientes/asignacion-manual']);
    });
  }
}
