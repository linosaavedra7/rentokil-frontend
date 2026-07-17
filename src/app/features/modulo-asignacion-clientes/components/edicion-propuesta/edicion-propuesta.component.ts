import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AsignacionClientesService } from '../../services/asignacion-clientes.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { diasLogisticos } from '../../../../shared/Constantes';

interface ResultadoOptimizacion {
  grupo_logistico: string;
  dia_logistico: string;
  saturacion: number;
  tiempo: number;
  ruta_recorrido: string;
  link_mapa: string;
}

@Component({
  selector: 'app-edicion-propuesta',
  templateUrl: './edicion-propuesta.component.html',
  styleUrls: ['./edicion-propuesta.component.css'],
})
export class EdicionPropuestaComponent implements OnInit {
  @Input() informacionRequerida: any[] = [];
  @Input() propuestaPrevia: any[] = [];
  @Output() eventoGuardar = new EventEmitter<boolean>();
  @Output() ocultarPropuestaPrevia = new EventEmitter<boolean>();
  @Output() mensaje = new EventEmitter<string>();
  @Output() eventoLoadingEdicion = new EventEmitter<boolean>();

  mensajeSpinner: string = '';
  diasLogisticos = diasLogisticos;
  diasLogisticosGrupoLog = [];
  tiemposFaltantes = [];
  horariosFaltantes = [];
  diasFaltantes = [];
  latitudLongitudFaltantes = [];
  datosEdicionPorModelo: any[] = [];
  datosEdicionManual: any[] = [];
  datosResultadoOptimizacion: any[] = [
    {
      rutero: '',
      dia_logistico: '',
      saturacion: -1,
      tiempo: -1,
    },
  ];
  informacionPropuestaAceptada: any[] = [];
  gruposLogisticos: any[] = [];

  mostrarSeccionEditar: boolean = true;
  mostrarDatosFaltantes: boolean = false;
  mostrarResultadoOptimizacion: boolean = false;
  mostrarTablaSaturaciones: boolean = false;
  mostrarBotones: boolean = false;
  mostrarInformacionPropuestaAceptada: boolean = false;
  mostrarInformacionPropuestaPrevia: boolean = false;
  loading: boolean = false;

  listado_direcciones: any;
  coordenadas = '';

  formularioEdicionModelo = this.formBuilder.group({
    notaVenta: [{ value: '', disabled: true }],
    zona: [{ value: '', disabled: true }],
    horario: [{ value: '', disabled: true }],
    dias: [{ value: '', disabled: true }],
    diaLogistico: ['', Validators.required],
  });

  formularioEdicionManual = this.formBuilder.group({
    notaVenta: [{ value: '', disabled: true }],
    zona: [{ value: '', disabled: true }],
    horario: [{ value: '', disabled: true }],
    dias: [{ value: '', disabled: true }],
    grupoLogistico: ['', Validators.required],
    diaLogistico: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private servicioAsignacionClientes: AsignacionClientesService,
    private servicioNotificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    this.formularioEdicionModelo.patchValue({
      notaVenta: this.informacionRequerida[0].nv,
      zona: this.informacionRequerida[0].zona,
      horario: this.informacionRequerida[0].horario,
      dias: this.informacionRequerida[0].dias,
    });
    this.formularioEdicionManual.patchValue({
      notaVenta: this.informacionRequerida[0].nv,
      zona: this.informacionRequerida[0].zona,
      horario: this.informacionRequerida[0].horario,
      dias: this.informacionRequerida[0].dias,
    });
    this.datosEdicionPorModelo = this.informacionRequerida;
    this.datosEdicionManual = this.informacionRequerida;
    this.obtenerGruposLogisticos();
  }

  retornarCero(): number {
    return 0;
  }

  verificarDatosFaltantes(): void {
    //this.mensajeSpinner = 'Verificando datos faltantes...';
    this.mensaje.emit(
      'Verificando datos faltantes...\n(Esto puede tardar unos minutos)'
    );
    this.eventoLoadingEdicion.emit(true);
    this.loading = true;
    this.mostrarSeccionEditar = false;
    const { diaLogistico } = this.formularioEdicionModelo.value;
    this.informacionRequerida[0].dia_logistico = diaLogistico;

    const datos = {
      nv: this.informacionRequerida[0].nv,
      zona: this.informacionRequerida[0].zona,
      horario: this.informacionRequerida[0].horario,
      dias: this.informacionRequerida[0].dias,
      dia_logistico: diaLogistico,
    };

    //console.log('datos');
    //console.log(datos);

    this.servicioAsignacionClientes.obtenerDatosFaltantes(datos).subscribe({
      next: (resp) => {
        if (resp.length == 0) return;
        this.tiemposFaltantes = resp[0].tiempos_faltantes;
        this.horariosFaltantes = resp[1].horarios_faltantes;
        this.diasFaltantes = resp[2].dias_faltantes;
        this.latitudLongitudFaltantes = resp[3].lat_long_faltantes;
        this.eventoLoadingEdicion.emit(false);
        this.loading = false;
        this.mostrarDatosFaltantes = true;
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(
          `Hubo un error al realizar la petición. ${error}`
        );
        this.loading = false;
        this.mostrarSeccionEditar = true;
      },
    });
  }

  obtenerDatosResultadoOptimizacion(event: any): void {
    let resultado = event;

    this.informacionPropuestaAceptada.push(resultado);
    this.datosResultadoOptimizacion[0].rutero = resultado.grupo_logistico;
    this.datosResultadoOptimizacion[0].dia_logistico = resultado.dia_logistico;
    this.datosResultadoOptimizacion[0].saturacion = resultado.saturacion;
    this.datosResultadoOptimizacion[0].tiempo = Math.trunc(resultado.tiempo);

    this.datosResultadoOptimizacion[0].ruta_recorrido =
      resultado.ruta_recorrido;
    this.datosResultadoOptimizacion[0].lat_long = resultado.lat_long;
    this.listado_direcciones = resultado.ruta_recorrido;
    this.listado_direcciones = this.listado_direcciones.substr(
      2,
      this.listado_direcciones.length - 4
    );
    this.listado_direcciones = this.listado_direcciones.split("', '");
    this.coordenadas = resultado.lat_long;

    this.formularioEdicionModelo.patchValue({
      diaLogistico: '',
    });
    this.mostrarDatosFaltantes = false;
    this.mostrarSeccionEditar = false;
    this.mostrarResultadoOptimizacion = true;
    this.mostrarBotones = true;
    this.loading = false;
  }

  guardarAsignacionActual(): void {
    this.mensaje.emit(
      'Guardando propuesta actual...\n(Esto puede tardar unos minutos)'
    );
    this.eventoGuardar.emit(true);
    this.mostrarBotones = false;

    
    const datos = {
      nv: this.informacionRequerida[0].nv,
      horario_perm: this.informacionRequerida[0].horario,
      dia_perm: this.informacionRequerida[0].dias,
    };

    const datosMod = {
      notaVenta : this.informacionRequerida[0].nv,
      diaLog: this.datosResultadoOptimizacion[0].dia_logistico,
      tipo:'asignacion'
    }
    
    this.servicioAsignacionClientes
      .guardarSegundoResultadoAsignacion(datos)
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.eventoGuardar.emit(false);
            this.mostrarBotones = true;
            return;
          }
          this.servicioNotificaciones.notificacionExito(resp);
          this.eventoGuardar.emit(false);
          this.ocultarPropuestaPrevia.emit(false);
          this.servicioAsignacionClientes.capturarTuplaModificaciones(datosMod).subscribe(
            (data) => {
              console.log(data)
            },
            (error) => {
              console.log(error)
            }
          )
          this.mostrarInformacionPropuestaAceptada = true;
        },
        error: (error) => {
          this.servicioNotificaciones.notificacionError(
            `Hubo un error al guardar la asignación. ${error}`
          );
          this.eventoGuardar.emit(false);
        },
      });
  }

  guardarAsignacionPrevia(): void {
    this.mensaje.emit(
      'Guardando propuesta previa...\n(Esto puede tardar unos minutos)'
    );
    this.eventoGuardar.emit(true);
    this.mostrarBotones = false;
    
    const datos = {
      nv: this.informacionRequerida[0].nv,
      horario_perm: this.informacionRequerida[0].horario,
      dia_perm: this.informacionRequerida[0].dias,
    };

    const datosMod = {
      notaVenta : this.informacionRequerida[0].nv,
      diaLog: this.propuestaPrevia[0].dia_logistico,
      tipo:'asignacion'
    }
    console.log(datosMod)
    
    
    this.servicioAsignacionClientes
      .guardarPrimerResultadoAsignacion(datos)
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.eventoGuardar.emit(false);
            this.mostrarBotones = true;
            return;
          }
          this.servicioNotificaciones.notificacionExito(resp);
          this.eventoGuardar.emit(false);
          this.servicioAsignacionClientes.capturarTuplaModificaciones(datosMod).subscribe(
            (data) => {
              console.log(data)
            },
            (error) => {
              console.log(error)
            }
          )
          this.mostrarInformacionPropuestaPrevia = true;
        },
        error: (error) => {
          this.servicioNotificaciones.notificacionError(
            `Hubo un error al guardar la asignación. ${error}`
          );
          this.eventoGuardar.emit(false);
        },
      });
  }

  cancelarAsignaciones(): void {
    this.servicioAsignacionClientes.cancelarResultadosAsignacion().subscribe({
      next: (resp) => {
        if (!resp) return;
        this.servicioNotificaciones.notificacionExito(resp);
        this.refrescarPagina();
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(
          `Hubo un error al cancelar. ${error}`
        );
      },
    });
  }

  generarPropuesta(): void {
    this.mensaje.emit(
      'Generando propuesta de asignación...\n(Esto puede tardar unos minutos)'
    );
    this.eventoLoadingEdicion.emit(true);
    //this.mensajeSpinner = 'Generando propuesta de asignación...';
    this.loading = true;
    this.mostrarSeccionEditar = false;
    const { grupoLogistico, diaLogistico } = this.formularioEdicionManual.value;

    const datos = {
      nv: this.informacionRequerida[0].nv,
      grupo_log: grupoLogistico.toUpperCase(),
      dia_log: diaLogistico,
    };

    this.servicioAsignacionClientes.generarPropuestaManual(datos).subscribe({
      next: (resp) => {
        if (resp.length == 0) return;
        this.informacionPropuestaAceptada.push(resp);
        this.datosResultadoOptimizacion[0].rutero = resp.grupo_logistico;
        this.datosResultadoOptimizacion[0].dia_logistico = resp.dia_logistico;
        this.datosResultadoOptimizacion[0].saturacion = resp.saturacion;
        this.datosResultadoOptimizacion[0].tiempo = Math.trunc(resp.tiempo);
        this.datosResultadoOptimizacion[0].ruta_recorrido = resp.ruta_recorrido;
        this.datosResultadoOptimizacion[0].lat_long = resp.lat_long;
        this.listado_direcciones = resp.ruta_recorrido;
        this.listado_direcciones = this.listado_direcciones.substr(
          2,
          this.listado_direcciones.length - 4
        );
        this.listado_direcciones = this.listado_direcciones.split("', '");
        this.coordenadas = resp.lat_long;

        this.mostrarSeccionEditar = false;
        this.mostrarResultadoOptimizacion = true;
        this.mostrarBotones = true;
        this.eventoLoadingEdicion.emit(false);
        this.loading = false;
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(
          `Hubo un error al generar la propuesta. ${error}`
        );
        this.loading = false;
      },
    });
  }

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/asignacion-de-clientes/asignacion-por-modelo']);
    });
  }

  volver(): void {
    this.mostrarResultadoOptimizacion = false;
    this.mostrarBotones = false;
    this.mostrarSeccionEditar = true;
  }

  groupBy(listaSaturaciones: any[], propiedad: string): any[] {
    return listaSaturaciones.reduce((memo, x) => {
      if (!memo[x[propiedad]]) {
        memo[x[propiedad]] = [];
      }
      memo[x[propiedad]].push(x);
      return memo;
    }, {});
  }

  obtenerGruposLogisticos(): void {
    /*
    let gruposLogisticos: any[] = [];
    this.servicioAsignacionClientes.obtenerSaturaciones().subscribe((resp) => {
      if (resp.length == 0) return;
      gruposLogisticos = this.groupBy(resp, 'grupo_log');
      let keyGrupos = Object.keys(gruposLogisticos);
      this.gruposLogisticos = keyGrupos.sort();
    });
    */
    this.servicioAsignacionClientes
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
    this.diasLogisticosGrupoLog.length = 0;
    this.formularioEdicionManual.patchValue({
      diaLogistico: '',
    });
    const datos = {
      grupo_log: grupo,
    };
    this.servicioAsignacionClientes
      .obtenerDiasLogisticos(datos)
      .subscribe((resp) => {
        if (!resp) return;
        this.diasLogisticosGrupoLog = resp.map((dato: any) => {
          return dato.dia;
        });
      });
  }
}
