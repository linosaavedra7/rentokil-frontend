import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { AsignacionClientesService } from '../../services/asignacion-clientes.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';

import {
  macrozonas,
  diasSemana,
  diasLogisticos,
} from '../../../../shared/Constantes';
import { MatOption } from '@angular/material/core';

interface Cliente {
  rut: string;
  nombre: string;
  notaVenta: number;
}

@Component({
  selector: 'app-asignacion-por-modelo',
  templateUrl: './asignacion-por-modelo.component.html',
  styleUrls: ['./asignacion-por-modelo.component.css'],
})
export class AsignacionPorModeloComponent implements OnInit {
  listaNavegacion: string[] = [
    '2) Asignación de Clientes',
    'Por modelo matemático',
  ];

  columnasTablaClientes: string[] = ['select', 'rut', 'nombre', 'nota_venta'];
  columnasTablaResultado: string[] = [
    'rutero',
    'dia_logistico',
    'saturacion',
    'tiempo',
  ];

  listaClientes = [];
  listaSaturaciones = [];
  macrozonas = macrozonas;
  listaDias = diasSemana;
  diasLogisticos = diasLogisticos;

  zonaClienteSeleccionado = '';
  mensajeSpinner: string = '';

  mostrarFormulario: boolean = false;
  mostrarClientes: boolean = true;
  hayDatosFaltantes: boolean = false;
  resultadoAsignacion: boolean = false;
  mostrarConfirmacionPropuesta: boolean = false;
  mostrarInformacionPropuestaAceptada: boolean = false;
  mostrarTablaSaturaciones: boolean = false;
  editarAsignacion: boolean = false;
  guardandoAsignacionEdicion: boolean = false;
  mostrarSeccionDerecha: boolean = true;
  loading: boolean = false;

  clienteSeleccionado: Cliente = {
    rut: '',
    nombre: '',
    notaVenta: 0,
  };
  permitirSeleccionMultiple: boolean = false;
  seleccion = new SelectionModel<any>(this.permitirSeleccionMultiple);

  tiemposFaltantes = [];
  horariosFaltantes = [];
  diasFaltantes = [];
  latitudLongitudFaltantes: any = [];

  datosFaltantes: any[] = [];

  listado_direcciones: any;
  coordenadas = '';

  resultado = [{ rutero: '', dia_logistico: '', saturacion: 0, tiempo: 0 }];
  informacionPropuestaAceptada: any[] = [];

  formularioInformacionRequerida = this.formBuilder.group({
    notaVenta: ['', Validators.required],
    macrozona: ['', Validators.required],
    diasDisponible: ['', Validators.required],
    horarioInicio: ['', Validators.required],
    horarioTermino: ['', Validators.required],
    diaLogistico: ['', Validators.required],
  });

  @ViewChild('todoSeleccionado') private todoSeleccionado!: MatOption;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private servicioAsignacionClientes: AsignacionClientesService,
    private servicioNotificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    this.obtenerClientesNuevos();
    //this.obtenerResultadoOptimizacion('');
    //this.mostrarInformacionPropuestaAceptada = true
  
  }

  /**
   * @description
   * Retorna cero para que la listas no sean ordenadas de forma ascendiente
   * @returns Número 0
   */
  retornarCero(): number {
    return 0;
  }

  /**
   * @description
   * Despliega los errores de validación del formulario.
   *
   * @param campo Nombre del campo donde se mostrará el mensaje de error.
   * @returns Retorna un mensaje de error si el campo dado existe.
   */
  erroresFormulario(campo: string): string {
    const {
      macrozona,
      diasDisponible,
      horarioInicio,
      horarioTermino,
      diaLogistico,
    } = this.formularioInformacionRequerida.controls;
    switch (campo) {
      case 'macrozona':
        if (macrozona.hasError('required')) {
          return 'El campo está vacío';
        }
        return '';

      case 'diasDisponible':
        if (diasDisponible.hasError('required')) {
          return 'El campo está vacío';
        }
        return '';

      case 'horarioInicio':
        if (horarioInicio.hasError('required')) {
          return 'El campo está vacío';
        }
        return 'El campo está incompleto';

      case 'horarioTermino':
        if (horarioTermino.hasError('required')) {
          return 'El campo está vacío';
        }
        return 'El campo está incompleto';

      case 'diaLogistico':
        if (diaLogistico.hasError('required')) {
          return 'El campo está vacío';
        }
        return '';

      default:
        return '';
    }
  }

  /**
   * @description
   * Limpia los formularios al guardar una propuesta de asignación
   * o al cancelar el proceso de asignación de clientes
   */
  limpiarFormularios() {
    this.formularioInformacionRequerida.reset();
    this.mostrarClientes = true;
    this.mostrarFormulario = true;
    this.hayDatosFaltantes = false;
    this.resultadoAsignacion = false;
  }

  verificarDatosFaltantes() {
    this.mensajeSpinner =
      'Verificando datos faltantes...\n(Esto puede tardar unos minutos)';
    this.loading = true;
    this.mostrarClientes = false;
    this.mostrarFormulario = false;
    const {
      notaVenta,
      macrozona,
      diasDisponible,
      horarioInicio,
      horarioTermino,
      diaLogistico,
    } = this.formularioInformacionRequerida.value;

    const horario = `${horarioInicio};${horarioTermino}`;

    const datos = {
      nv: notaVenta,
      zona: macrozona,
      horario: horario,
      dias: diasDisponible.join(', '),
      dia_logistico: diaLogistico,
    };

    this.datosFaltantes.push({
      nv: datos.nv,
      zona: datos.zona,
      horario: datos.horario,
      dias: datos.dias,
      dia_logistico: datos.dia_logistico,
    });

    try {
      this.servicioAsignacionClientes.obtenerDatosFaltantes(datos).subscribe({
        next: (resp) => {
          if (resp.length == 0) {
            this.loading = false;
            this.mostrarClientes = true;
            this.mostrarFormulario = true;
            return;
          }
          this.loading = false;
          this.tiemposFaltantes = resp[0].tiempos_faltantes;
          this.horariosFaltantes = resp[1].horarios_faltantes;
          this.diasFaltantes = resp[2].dias_faltantes;
          this.latitudLongitudFaltantes = resp[3].lat_long_faltantes;
          this.hayDatosFaltantes = true;
        },
        error: (error) => {
          this.loading = false;
          this.refrescarPagina();
        },
      });
    } catch (error) {
      this.loading = false;
      this.servicioNotificaciones.notificacionError(
        'Hubo un error con la petición'
      );
      this.mostrarClientes = true;
      this.mostrarFormulario = true;
    }
  }

  obtenerClientesNuevos(): void {
    this.mensajeSpinner = 'Cargando clientes nuevos...';
    this.loading = true;
    this.servicioAsignacionClientes.obtenerNotasVentaNuevas().subscribe({
      next: (resp) => {
        if (resp.length == 0) {
          this.loading = false;
          return;
        }
        this.listaClientes = resp;
        this.loading = false;
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(error);
        this.loading = false;
      },
    });
  }

  obtenerClienteSeleccionado(): void {
    try {
      this.formularioInformacionRequerida.patchValue({
        notaVenta: this.seleccion.selected[0].nota_venta,
      });
      this.clienteSeleccionado.rut = this.seleccion.selected[0].rut;
      this.clienteSeleccionado.nombre = this.seleccion.selected[0].nombre;
      this.clienteSeleccionado.notaVenta =
        this.seleccion.selected[0].nota_venta;
      this.mostrarFormulario = true;

      this.servicioAsignacionClientes
        .obtenerZonaCliente(this.clienteSeleccionado)
        .subscribe({
          next: (resp) => {
            console.log(resp);
            if (resp != 'N/A') {
              this.zonaClienteSeleccionado = '- Zona: ' + resp;
            } else {
              this.zonaClienteSeleccionado = '';
            }
          },
          error: (error) => {
            console.log(error);
          },
        });
    } catch (error) {
      this.formularioInformacionRequerida.patchValue({
        notaVenta: '',
      });
      this.clienteSeleccionado.nombre = '';
      this.mostrarFormulario = false;
    }
  }

  obtenerResultadoOptimizacion(event: any): void {
    this.hayDatosFaltantes = false;
    this.resultadoAsignacion = true;
    this.mostrarConfirmacionPropuesta = true;

    let resultado = event;
    this.informacionPropuestaAceptada.push(resultado);
    this.resultado[0].rutero = resultado.grupo_logistico;
    this.resultado[0].dia_logistico = resultado.dia_logistico;
    this.resultado[0].saturacion = resultado.saturacion;
    this.resultado[0].tiempo = Math.trunc(resultado.tiempo);
    this.coordenadas = resultado.lat_long;
    this.listado_direcciones = resultado.ruta_recorrido;
    this.listado_direcciones = resultado.ruta_recorrido.substr(
      2,
      this.listado_direcciones.length - 4
    );
    this.listado_direcciones = this.listado_direcciones.split("', '");
    /*
    this.resultado[0].rutero = 'GH24'
    this.resultado[0].dia_logistico = 'A5'
    this.resultado[0].saturacion = 45.69
    this.resultado[0].tiempo = 219
    this.coordenadas = '-33.41605573223399,-70.60439798516121/-33.4142033,-70.6061106/-33.43825131764706,-70.64547929999999'
    this.listado_direcciones = "['Miraflores 383, Santiago', 'Av Los Trapenses 2140 local 105', 'Av. La Dehesa 2245, Lo Barnechea', 'El Rodeo 14200, Lo Barnechea', 'El Rodeo, 12850', 'Av. La Dehesa 1445, Lo Barnechea']"
    this.listado_direcciones = this.listado_direcciones.substr(2,this.listado_direcciones.length-4)
    this.listado_direcciones = this.listado_direcciones.split("', '")
    */
  }

  aceptarPropuesta(): void {
    this.mensajeSpinner =
      'Guardando propuesta...\n(Esto puede tardar unos minutos)';
    this.loading = true;
    this.mostrarConfirmacionPropuesta = false;

    const { notaVenta, horarioInicio, horarioTermino, diasDisponible } =
      this.formularioInformacionRequerida.value;

    const datos = {
      nv: notaVenta,
      horario_perm: `${horarioInicio};${horarioTermino}`,
      dia_perm: diasDisponible.join(', '),
    };

    const datosMod = {
      notaVenta : notaVenta,
      diaLog: this.resultado[0].dia_logistico,
      tipo:'asignacion'
    }
    
    try {
      this.servicioAsignacionClientes.guardarPropuesta(datos).subscribe({
        next: (resp) => {
          if (!resp) {
            this.loading = false;
            this.mostrarConfirmacionPropuesta = true;
            return;
          }
          this.servicioAsignacionClientes.capturarTuplaModificaciones(datosMod).subscribe(
            (data) => {
              console.log(data)
            },
            (error) => {
              console.log(error)
            }
          )
          this.servicioNotificaciones.notificacionExito(resp);
          this.loading = false;
          this.mostrarInformacionPropuestaAceptada = true;
        },
        error: (error) => {
          this.servicioNotificaciones.notificacionError(
            `Hubo un error al guardar la propuesta de asignación. ${error}`
          );

          this.loading = false;
          this.mostrarConfirmacionPropuesta = true;
          this.refrescarPagina();
        },
      });
    } catch (error) {
      this.servicioNotificaciones.notificacionError(
        `Ocurrió un error! ${error}`
      );
      this.loading = false;
      this.mostrarConfirmacionPropuesta = true;
    }
  }

  descartarPropuesta(): void {
    this.servicioAsignacionClientes.descartarResultadoAsignacion().subscribe({
      next: (resp) => {
        this.servicioNotificaciones.notificacionExito(resp);
        this.refrescarPagina();
      },
      error: (error) => {
        this.servicioNotificaciones.notificacionError(error);
        this.refrescarPagina();
      },
    });
  }

  seleccionarTodo(): void {
    if (this.todoSeleccionado.selected) {
      let dias = ['L', 'M', 'I', 'J', 'V'];

      this.formularioInformacionRequerida.patchValue({
        diasDisponible: [...dias.map((dia) => dia)],
      });
    } else {
      this.formularioInformacionRequerida.patchValue({
        diasDisponible: '',
      });
    }
  }

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/asignacion-de-clientes/asignacion-por-modelo']);
    });
  }
}
