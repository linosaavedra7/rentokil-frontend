import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { NotificacionService } from 'src/app/shared/services/notificacion.service';

import { FileService } from 'src/app/shared/services/file.service';
import { environment } from 'src/environments/environment';

import * as Mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit {
  info: any;

  /*Variables que permiten navegar entre las ventanas
  de Servicios, Direcciones y Mapa dentro del modal*/
  modal_ser: boolean = false;
  modal_dir: boolean = false;
  modal_map: boolean = false;
  modal_fin: boolean = false;
  faltan_dir:boolean = false
  loading: boolean = true;
  mensajeSpinner = 'Cargando...'

  /* Conjunto de clientes unicos */
  clientes_unicos: String[] = [];
  /* Conjunto de servicios repetidos*/
  servicios_repetidos: String[] = [];

  /*Conjunto de direcciones mal escritas*/
  dir_mal_escritas: String[] = [];
  /*Conjunto de coordenadas de las direcciones*/
  lat_long_dirs: any = [];

  direccion_unica: String = '';

  tipoCliente = ""

  constructor(
    private fileService: FileService,
    private formBuilder: FormBuilder,
    private matDialog: MatDialog,
    private servicioNotificaciones: NotificacionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.info = data.info;
    this.loading = data.loading;
    this.tipoCliente = data.tipoCliente;
  }

  ngOnInit(): void {
    if (this.loading != true) {
      if (this.info.length != 0) {
        this.modal_servicios();
      } else {
        this.loading = true;
        this.modal_direcciones();
      }
    }
  }

  modal_servicios() {
    /*Cambios de variables de navegacion para
    entrar en el modal de Servicios*/
    this.modal_ser = true;
    this.modal_dir = false;
    this.modal_map = false;

    /*Variables auxiliares para obtener 
    clientes y servicios sin repeticion y ordenados*/
    this.clientes_unicos = [];
    this.servicios_repetidos = [];

    const nota_venta: String[] = [];

    /*Se captura la nota de venta y la info de servicios repetidos*/
    for (let i = 0; i < this.info.length; i++) {
      nota_venta.push(this.info[i][0][0]);
      this.servicios_repetidos.push(this.info[i][0].slice(0, 6));
    }

    /*for(let i = 0 ; i < this.info.length; i++){
      if(this.info[i].length > 1){
        for(let j = 0 ; j < this.info[j].length; j++){
          nota_venta.push(this.info[i][j][0])
          this.servicios_repetidos.push(this.info[i][j].slice(0,6))
          console.log('mas de uno')
        }
      }
      else{
        nota_venta.push(this.info[i][0][0])
        this.servicios_repetidos.push(this.info[i][0].slice(0,6))
        console.log('solo uno')
      }
    }*/

    /*filtro para dejar solo notas de ventas de clientes unicos*/
    this.clientes_unicos = nota_venta.filter((item, index) => {
      return nota_venta.indexOf(item) === index;
    });

    /*Por cada cliente unico, se busca informacion a partir del servicio*/
    for (let i = 0; i < this.clientes_unicos.length; i++) {
      for (let j = 0; j < this.servicios_repetidos.length; j++) {
        if (this.clientes_unicos[i] == this.servicios_repetidos[j][0]) {
          this.clientes_unicos[i] = this.servicios_repetidos[j].slice(0, 3);
        }
      }
    }

    /*Se ordenan los servicios por nota de venta, para mostrarlos ordenados*/
    const servicios_ordenados: String[] = [];
    for (let i = 0; i < this.clientes_unicos.length; i++) {
      for (let j = 0; j < this.servicios_repetidos.length; j++) {
        if (this.clientes_unicos[i][0] == this.servicios_repetidos[j][0]) {
          //console.log(this.clientes_unicos[i][0] + " - " + this.servicios_repetidos[j][0])
          servicios_ordenados.push(this.servicios_repetidos[j]);
        }
      }
    }
    this.servicios_repetidos = servicios_ordenados;
  }

  modal_direcciones() {
    /*Cambios de variables de navegacion para
    entrar en el modal de Direcciones*/
    this.modal_ser = false;
    this.modal_dir = true;
    this.modal_map = false;

    /*Solicitud para obtener las direcciones mal escritas*/
    if (this.dir_mal_escritas.length == 0) {
      this.fileService.buscar_dir_mal_escritas().subscribe(
        (data) => {
          if (data.length != 0) {
            this.dir_mal_escritas = data;
            this.lat_long_dirs = this.dir_mal_escritas.slice();
            this.loading = false;
          } else {
            this.modal_final();
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }

    /*Verifica si las direcciones ya tienen sus coordenadas para pintar azul el boton editar*/
    setTimeout(() => {
      for (let i = 0; i < this.lat_long_dirs.length; i++) {
        if (this.lat_long_dirs[i].length == 2) {
          const boton = document.getElementById('boton' + i) as HTMLElement;
          boton.setAttribute('style', 'background-color: #0076c4;');
        }
      }
    }, 100);
  }

  modal_mapa(indice: any) {
    /*Cambios de variables de navegacion para
    entrar en el modal de Mapa*/
    this.modal_ser = false;
    this.modal_dir = false;
    this.modal_map = true;
    this.direccion_unica = this.dir_mal_escritas[indice][2];

    var latitud = -33.45694;
    var longitud = -70.64827;

    if (this.lat_long_dirs[indice].length == 2) {
      latitud = this.lat_long_dirs[indice][0];
      longitud = this.lat_long_dirs[indice][1];
    }

    /*Creacion del mapa para desplegarlo en el modal*/
    setTimeout(() => {
      var mapa = new Mapboxgl.Map({
        accessToken: environment.mapbox.accessToken,
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longitud, latitud],
        zoom: 10,
      });

      /*Posicionar un marcador en el mapa*/
      var marker = new Mapboxgl.Marker({ draggable: true, color: 'blue' })
        .setLngLat([longitud, latitud])
        .addTo(mapa);
      marker.on('drag', () => {
        this.lat_long_dirs[indice] = [
          marker.getLngLat().lat,
          marker.getLngLat().lng,
        ];
        this.faltan_dir = false
      });

      /*Barra de busqueda (geocoder) auxiliar en el mapa*/
      var geocoder = new MapboxGeocoder({
        accessToken: environment.mapbox.accessToken,
        marker: false,
      });
      mapa.addControl(geocoder);
      geocoder.on('result', (e) => {
        marker.setLngLat(e.result.center).addTo(mapa);
        this.lat_long_dirs[indice] = [e.result.center[1], e.result.center[0]];
        this.faltan_dir = false
      });
    }, 100);
  }

  modal_final() {
    //Consideraciones para pasar al modal final
    //Si no hay direcciones, pasa al modal final
    if (this.dir_mal_escritas.length == 0) {
      this.loading = false;
      this.modal_ser = false;
      this.modal_dir = false;
      this.modal_map = false;
      this.modal_fin = true;
    } else {
      //Si hay direcciones, revisa si se han capturado todas las coordendas

      for (let i = 0; i < this.lat_long_dirs.length; i++) {
        if (this.lat_long_dirs[i].length != 2) {
          console.log('falta una direccion');
          this.faltan_dir = true
        }
      }
      //Si se han capturado todas las direcciones
      //Pasa al modal final
      if (this.faltan_dir == false) {
        this.loading = false;
        this.modal_ser = false;
        this.modal_dir = false;
        this.modal_map = false;
        this.modal_fin = true;
      }
    }
  }

  async guardar_todo() {
    /*Metodo que guarda las tuplas nuevas de los archivo en un excel
    y lo agregue a la base de datos en archivo finales*/

    this.loading = true
    this.mensajeSpinner = "Guardando nuevos clientes"

    const direcciones_corregidas = this.formBuilder.array([]);

    for (let i = 0; i < this.dir_mal_escritas.length; i++) {
      let nombre = this.dir_mal_escritas[i][1];
      let direccion = this.dir_mal_escritas[i][2];
      let latitud = this.lat_long_dirs[i][0];
      let longitud = this.lat_long_dirs[i][1];
      const direcccion_corregida = this.formBuilder.group({
        nombre: nombre,
        direccion: direccion,
        latitud: latitud,
        longitud: longitud,
      });
      direcciones_corregidas.push(direcccion_corregida);
    }
    const data = direcciones_corregidas.value;
    await this.fileService.corregir_direcciones(data).toPromise().then(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );

    let mensaje = ""
    if(this.tipoCliente == 'antiguo'){
      await this.fileService.agregar_clientes_antiguo_masivo().toPromise().then(
        (data) => {
          console.log(data);
          mensaje = data
        },
        (error) => {
          console.log(error);
        }
      );

    }
    else{
      await this.fileService.agregar_clientes_nuevo_masivo().toPromise().then(
        (data) => {
          console.log(data);
          mensaje = data
        },
        (error) => {
          console.log(error);
        }
      );
    }
    
    this.loading = false
    this.matDialog.closeAll();
    this.servicioNotificaciones.notificacionExito(mensaje);
    
  }

  set_loading(load: boolean) {
    this.loading = load;
  }

  cancelar_archivos() {
    this.fileService.cancelar_archivos().subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
    this.matDialog.closeAll();
  }
}
