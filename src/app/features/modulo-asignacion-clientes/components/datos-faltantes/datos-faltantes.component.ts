import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { AsignacionClientesService } from '../../services/asignacion-clientes.service';
import { diasSemana } from '../../../../shared/Constantes';
import { FileService } from 'src/app/shared/services/file.service';

interface ObjetoGenerico {
  [key: string]: any;
}

@Component({
  selector: 'app-datos-faltantes',
  templateUrl: './datos-faltantes.component.html',
  styleUrls: ['./datos-faltantes.component.css'],
})
export class DatosFaltantesComponent implements OnInit {
  @Input() informacionRequerida: any[] = [];
  @Input() tiemposFaltantes: string[] = [];
  @Input() horariosFaltantes: string[] = [];
  @Input() diasFaltantes: string[] = [];
  @Input() latLongFaltantes: string[] = [];
  @Input() esEditarAsignacion: boolean = false;

  @Output() resultadoOptimizacionEvent = new EventEmitter<ObjetoGenerico>();
  @Output() eventoMensajeSpinner = new EventEmitter<string>();
  @Output() eventoLoadingDatosFaltantes = new EventEmitter<boolean>();

  expresionRegularHorario =
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9];(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](,?(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9];(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])?$/;

  listaDias = diasSemana;
  matrizTiempos: any[] = [];
  matrizHorarios: any[] = [];
  matrizDias: any[] = [];
  matrizLatitudLongitud: any[] = [];
  matrizResultadoOptimizacion: any[] = [];

  matrizTiemposPredeterminados: number[] = [];
  matrizHorariosPredeterminados: string[] = [];
  matrizDiasPredeterminados: string[] = [];

  noHayCamposVacios: boolean[] = [];
  mostrarDatosFaltantes: boolean = true;
  loading: boolean = false;

  constructor(
    private router: Router,
    private servicioNotificaciones: NotificacionService,
    private servicioAsignacionClientes: AsignacionClientesService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.tiemposFaltantes.forEach((elemento, index) => {
      this.matrizTiempos.push({
        posicion: index,
        direccion: elemento,
        tiempo: '',
      });
    });

    this.horariosFaltantes.forEach((elemento, index) => {
      this.matrizHorarios.push({
        posicion: index,
        direccion: elemento,
        horario: '',
      });
    });

    this.diasFaltantes.forEach((elemento, index) => {
      this.matrizDias.push({
        posicion: index,
        direccion: elemento,
        dias: '',
      });
    });

    this.latLongFaltantes.forEach((elemento, index) => {
      this.matrizLatitudLongitud.push({
        posicion: index,
        direccion: elemento,
        latLong: '',
      });
    });
  }

  retornarCero(): number {
    return 0;
  }

  evitarDecimales(event: any): void {
    if (event.key === '.') {
      event.preventDefault();
    }
  }

  chequearFormatoHorario(event: any): void {
    let horario = event.target.value;
    if (!this.expresionRegularHorario.test(horario)) {
      event.target.value = '';
      this.servicioNotificaciones.notificacionError(
        'El horario no cumple con el formato especificado'
      );
    }
  }

  guardarTiempo(event: any): void {
    const direccion = event.target.id;
    const tiempo = event.target.value;
    const posicion = this.tiemposFaltantes.indexOf(direccion);

    if (tiempo !== '') {
      this.matrizTiempos.forEach((item) => {
        if (item.posicion == posicion) item.tiempo = tiempo;
      });
    } else {
      this.matrizTiempos.forEach((item) => {
        if (item.posicion == posicion) item.tiempo = '';
      });
    }
  }

  guardarHorario(event: any): void {
    const posicion = event.target.id;
    let horario = event.target.value;
    horario = horario.replace(/\s/g, '');

    if (horario !== '') {
      this.matrizHorarios.forEach((item, index) => {
        if (index == posicion) {
          item.horario = horario;
        }
      });
    } else {
      this.matrizHorarios.forEach((item, index) => {
        if (index == posicion) {
          item.horario = '';
        }
      });
    }
  }

  guardarDias(event: any): void {
    const posicion = event.source.id;
    const dias = event.source.value;

    if (dias !== '') {
      this.matrizDias.forEach((item, index) => {
        if (index == posicion) {
          item.dias = dias;
        }
      });
    } else {
      this.matrizDias.forEach((item, index) => {
        if (index == posicion) {
          item.dias = '';
        }
      });
    }
  }

  guardarLatitudLongitud(event: any): void {
    const posicion = event.target.id;
    const latitudLongitud = event.target.value;
    console.log(latitudLongitud);

    if (latitudLongitud !== '') {
      this.matrizLatitudLongitud.forEach((item, index) => {
        if (index == posicion) {
          item.latLong = latitudLongitud;
        }
      });
    } else {
      this.matrizLatitudLongitud.forEach((item, index) => {
        if (index == posicion) {
          item.latLong = '';
        }
      });
    }
  }

  enviarResultadoOptimizacion(resultado: ObjetoGenerico): void {
    this.resultadoOptimizacionEvent.emit(resultado);
  }

  generarPropuesta(): void {
    for (const i in this.matrizTiempos) {
      this.matrizTiempos[i].tiempo == ''
        ? this.noHayCamposVacios.push(false)
        : this.noHayCamposVacios.push(true);
    }
    for (const i in this.matrizHorarios) {
      this.matrizHorarios[i].horario == ''
        ? this.noHayCamposVacios.push(false)
        : this.noHayCamposVacios.push(true);
    }
    for (const i in this.matrizDias) {
      this.matrizDias[i].dias == ''
        ? this.noHayCamposVacios.push(false)
        : this.noHayCamposVacios.push(true);
    }
    for (const i in this.matrizLatitudLongitud) {
      this.matrizLatitudLongitud[i].latLong == ''
        ? this.noHayCamposVacios.push(false)
        : this.noHayCamposVacios.push(true);
    }

    if (this.noHayCamposVacios.every(Boolean)) {
      this.eventoMensajeSpinner.emit(
        'Generando propuesta de asignación...\n(Esto puede tardar unos minutos)'
      );
      this.eventoLoadingDatosFaltantes.emit(true);
      this.loading = true;
      this.mostrarDatosFaltantes = false;

      let tiempos = [];
      let horarios = [];
      let dias = [];
      let latitudesLongitudes = [];

      for (const i in this.matrizTiempos) {
        tiempos.push(Number(this.matrizTiempos[i].tiempo));
      }
      for (const i in this.matrizHorarios) {
        horarios.push(this.matrizHorarios[i].horario);
      }
      for (const i in this.matrizDias) {
        for (const j in this.matrizDias[i].dias) {
          dias.push(this.matrizDias[i].dias[j]);
        }
      }
      for (const i in this.matrizLatitudLongitud) {
        /*let latitudLongitud = [];
        latitudLongitud.push(this.matrizLatitudLongitud[i].latLong)*/
        latitudesLongitudes.push(this.matrizLatitudLongitud[i].latLong);
      }

      const datos = {
        nv: this.informacionRequerida[0].nv,
        zona: this.informacionRequerida[0].zona,
        horario: this.informacionRequerida[0].horario,
        dias: this.informacionRequerida[0].dias,
        dia_logistico: this.informacionRequerida[0].dia_logistico,
        tiempos_faltantes: this.tiemposFaltantes,
        horarios_faltantes: this.horariosFaltantes,
        dias_faltantes: this.diasFaltantes,
        lat_long_faltantes: this.latLongFaltantes,
        lista_tiempos: tiempos,
        lista_horarios: horarios,
        lista_dias: dias,
        lista_lat_long: latitudesLongitudes,
      };

      if (!this.esEditarAsignacion) {
        this.servicioAsignacionClientes.generarPropuesta(datos).subscribe({
          next: (resp) => {
            if (resp.length == 0) this.refrescarPagina();
            let resultado: ObjetoGenerico = {};
            resultado['grupo_logistico'] = resp.grupo_logistico;
            resultado['dia_logistico'] = resp.dia_logistico;
            resultado['saturacion'] = resp.saturacion;
            resultado['tiempo'] = resp.tiempo;
            resultado['ruta_recorrido'] = resp.ruta_recorrido;
            resultado['link_mapa'] = resp.link_mapa;
            resultado['lat_long'] = resp.lat_long;
            console.log(resp.lat_long);
            this.enviarResultadoOptimizacion(resultado);
            this.eventoLoadingDatosFaltantes.emit(false);
            this.loading = false;
          },
          error: (error) => {
            this.servicioNotificaciones.notificacionError(error);
            this.loading = false;
            this.mostrarDatosFaltantes = true;
            this.refrescarPagina();
          },
        });
      } else {
        this.servicioAsignacionClientes
          .generarPropuestaEditada(datos)
          .subscribe({
            next: (resp) => {
              if (resp.length == 0) this.refrescarPagina();
              let resultado: ObjetoGenerico = {};
              resultado['grupo_logistico'] = resp.grupo_logistico;
              resultado['dia_logistico'] = resp.dia_logistico;
              resultado['saturacion'] = resp.saturacion;
              resultado['tiempo'] = resp.tiempo;
              resultado['ruta_recorrido'] = resp.ruta_recorrido;
              resultado['link_mapa'] = resp.link_mapa;
              resultado['lat_long'] = resp.lat_long;
              console.log(resp.lat_long);
              this.enviarResultadoOptimizacion(resultado);
              this.eventoLoadingDatosFaltantes.emit(false);
              this.loading = false;
            },
            error: (error) => {
              this.servicioNotificaciones.notificacionError(error);
              this.loading = false;
              this.mostrarDatosFaltantes = true;
              this.refrescarPagina();
            },
          });
      }
    } else {
      this.servicioNotificaciones.notificacionError('Hay campos vacíos!');
    }
    //this.noHayCamposVacios.length = 0;
  }

  generarPropuestaSinDatosFaltantes(): void {
    this.eventoMensajeSpinner.emit(
      'Generando propuesta de asignación...\n(Esto puede tardar unos minutos)'
    );
    this.eventoLoadingDatosFaltantes.emit(true);
    this.loading = true;
    this.mostrarDatosFaltantes = false;

    const datos = {
      nv: this.informacionRequerida[0].nv,
      zona: this.informacionRequerida[0].zona,
      horario: this.informacionRequerida[0].horario,
      dias: this.informacionRequerida[0].dias,
      dia_logistico: this.informacionRequerida[0].dia_logistico,
      tiempos_faltantes: this.tiemposFaltantes,
      horarios_faltantes: this.horariosFaltantes,
      dias_faltantes: this.diasFaltantes,
      lat_long_faltantes: this.latLongFaltantes,
      lista_tiempos: [],
      lista_horarios: [],
      lista_dias: [],
      lista_lat_long: [],
    };
    if (!this.esEditarAsignacion) {
      this.servicioAsignacionClientes.generarPropuesta(datos).subscribe({
        next: (resp) => {
          if (resp.length == 0) this.refrescarPagina();
          let resultado: ObjetoGenerico = {};
          resultado['grupo_logistico'] = resp.grupo_logistico;
          resultado['dia_logistico'] = resp.dia_logistico;
          resultado['saturacion'] = resp.saturacion;
          resultado['tiempo'] = resp.tiempo;
          resultado['ruta_recorrido'] = resp.ruta_recorrido;
          resultado['link_mapa'] = resp.link_mapa;
          resultado['lat_long'] = resp.lat_long;
          this.enviarResultadoOptimizacion(resultado);
          this.eventoLoadingDatosFaltantes.emit(false);
          this.loading = false;
        },
        error: (error) => {
          this.servicioNotificaciones.notificacionError(error);
          this.loading = false;
          this.mostrarDatosFaltantes = true;
          this.refrescarPagina();
        },
      });
    } else {
      this.servicioAsignacionClientes.generarPropuestaEditada(datos).subscribe({
        next: (resp) => {
          if (resp.length == 0) this.refrescarPagina();
          let resultado: ObjetoGenerico = {};
          resultado['grupo_logistico'] = resp.grupo_logistico;
          resultado['dia_logistico'] = resp.dia_logistico;
          resultado['saturacion'] = resp.saturacion;
          resultado['tiempo'] = resp.tiempo;
          resultado['ruta_recorrido'] = resp.ruta_recorrido;
          resultado['link_mapa'] = resp.link_mapa;
          resultado['lat_long'] = resp.lat_long;
          this.enviarResultadoOptimizacion(resultado);
          this.eventoLoadingDatosFaltantes.emit(false);
          this.loading = false;
        },
        error: (error) => {
          this.servicioNotificaciones.notificacionError(error);
          this.loading = false;
          this.mostrarDatosFaltantes = true;
          this.refrescarPagina();
        },
      });
    }
  }

  noHayDatosFaltantes(): boolean {
    if (
      this.tiemposFaltantes.length == 0 &&
      this.horariosFaltantes.length == 0 &&
      this.diasFaltantes.length == 0 &&
      this.latLongFaltantes.length == 0
    ) {
      return true;
    }
    return false;
  }

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/asignacion-de-clientes/asignacion-por-modelo']);
    });
  }

  rellenarDatos(): void {
    this.tiemposFaltantes.forEach(() => {
      this.matrizTiemposPredeterminados.push(60);
    });

    this.horariosFaltantes.forEach(() => {
      this.matrizHorariosPredeterminados.push('08:00;18:00');
    });

    this.diasFaltantes.forEach(() => {
      this.matrizDiasPredeterminados.push('L, M, I, J, V');
    });

    this.eventoMensajeSpinner.emit(
      'Generando propuesta de asignación...\n(Esto puede tardar unos minutos)'
    );
    this.eventoLoadingDatosFaltantes.emit(true);
    this.loading = true;
    this.mostrarDatosFaltantes = false;

    const datos = {
      nv: this.informacionRequerida[0].nv,
      zona: this.informacionRequerida[0].zona,
      horario: this.informacionRequerida[0].horario,
      dias: this.informacionRequerida[0].dias,
      dia_logistico: this.informacionRequerida[0].dia_logistico,
      tiempos_faltantes: this.tiemposFaltantes,
      horarios_faltantes: this.horariosFaltantes,
      dias_faltantes: this.diasFaltantes,
      lat_long_faltantes: this.latLongFaltantes,
      lista_tiempos: this.matrizTiemposPredeterminados,
      lista_horarios: this.matrizHorariosPredeterminados,
      lista_dias: this.matrizDiasPredeterminados,
      lista_lat_long: [],
    };

    if (!this.esEditarAsignacion) {
      this.servicioAsignacionClientes
        .generarPropuesta(datos)
        .subscribe((resp) => {
          if (resp.length == 0) this.refrescarPagina();
          let resultado: ObjetoGenerico = {};
          resultado['grupo_logistico'] = resp.grupo_logistico;
          resultado['dia_logistico'] = resp.dia_logistico;
          resultado['saturacion'] = resp.saturacion;
          resultado['tiempo'] = resp.tiempo;
          resultado['ruta_recorrido'] = resp.ruta_recorrido;
          resultado['link_mapa'] = resp.link_mapa;
          resultado['lat_long'] = resp.lat_long;
          this.enviarResultadoOptimizacion(resultado);
          this.eventoLoadingDatosFaltantes.emit(false);
          this.loading = false;
        });
    } else {
      this.servicioAsignacionClientes.generarPropuestaEditada(datos).subscribe({
        next: (resp) => {
          if (resp.length == 0) this.refrescarPagina();
          let resultado: ObjetoGenerico = {};
          resultado['grupo_logistico'] = resp.grupo_logistico;
          resultado['dia_logistico'] = resp.dia_logistico;
          resultado['saturacion'] = resp.saturacion;
          resultado['tiempo'] = resp.tiempo;
          resultado['ruta_recorrido'] = resp.ruta_recorrido;
          resultado['link_mapa'] = resp.link_mapa;
          resultado['lat_long'] = resp.lat_long;
          this.enviarResultadoOptimizacion(resultado);
          this.eventoLoadingDatosFaltantes.emit(false);
          this.loading = false;
        },
      });
    }
  }
}
