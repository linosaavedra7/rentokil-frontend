import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacionService } from 'src/app/shared/services/notificacion.service';
import {
  macrozonas,
  diasLogisticosCompleto,
} from '../../../../shared/Constantes';
import { GestionRutasService } from '../../services/gestion-rutas.service';

@Component({
  selector: 'app-agregar-grupo-logistico',
  templateUrl: './grupo-logistico.component.html',
  styleUrls: ['./grupo-logistico.component.css'],
})
export class GrupoLogisticoComponent implements OnInit {
  listaNavegacion: string[] = ['3) Gestión de rutas', 'Grupo logístico'];
  listaMacrozonas = macrozonas;
  listaDiasLogisticos = diasLogisticosCompleto;
  gruposLogisticos: any[] = [];
  diasOperacion: any[] = [];

  mensajeSpinner: string = '';
  nombreEjecutivo: string = '';

  mostrarFormulario: boolean = true;
  existeGrupo: boolean = false;
  loading: boolean = false;

  formularioGrupoLogistico = this.formBuilder.group({
    nombre: ['', Validators.required],
    ejecutivo: ['', Validators.required],
    zona: ['', Validators.required],
    dupla: ['', Validators.required],
    dias: ['', Validators.required],
    linea: ['', Validators.required],
    sucursal: ['', Validators.required],
  });

  formularioDiasOperacion = this.formBuilder.group({
    grupoLogistico: ['', Validators.required],
    diasLogisticos: ['', Validators.required],
  });

  formularioEditarEjecutivo = this.formBuilder.group({
    grupoLogistico: ['', Validators.required],
    ejecutivo: ['', Validators.required],
    zona: [{ value: '', disabled: true }, Validators.required],
    linea: [{ value: '', disabled: true }, Validators.required],
    sucursal: [{ value: '', disabled: true }, Validators.required],
  });

  lineas: string[] = ['Higiene'];
  sucursales: string[] = ['Santiago'];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private servicioGestionRutas: GestionRutasService,
    private servicioNotificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    this.obtenerGruposLogisticos();
  }

  retornarCero(): number {
    return 0;
  }

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/gestion-de-rutas/grupo-logistico']);
    });
  }

  guardarGrupoLogistico(): void {
    this.mensajeSpinner = 'Guardando grupo logístico...';
    this.mostrarFormulario = false;
    this.loading = true;
    const { nombre, ejecutivo, zona, dupla, dias, linea, sucursal } =
      this.formularioGrupoLogistico.value;

    const datos = {
      nombre: nombre.toUpperCase(),
      ejecutivo: ejecutivo,
      zona: zona,
      dupla: dupla,
      lista_dias: dias,
      linea: linea,
      sucursal: sucursal,
    };

    this.servicioGestionRutas.guardarGrupoLogistico(datos).subscribe((resp) => {
      if (resp == false) {
        this.servicioNotificaciones.notificacionError(
          'El grupo logístico ya existe'
        );
        //this.refrescarPagina();
        return;
      }
      this.servicioNotificaciones.notificacionExito('Grupo logístico agregado');
      this.formularioGrupoLogistico.reset();
      this.loading = false;
      this.mostrarFormulario = true;
      this.obtenerGruposLogisticos();
    });
  }

  obtenerGruposLogisticos(): void {
    this.mensajeSpinner = 'Cargando grupos logísticos...';
    this.loading = true;
    this.servicioGestionRutas.obtenerGruposLogisticos().subscribe((resp) => {
      if (resp.length == 0) {
        this.loading = false;
        return;
      }
      this.gruposLogisticos = resp.map((dato: any) => {
        return dato.grupo;
      });
      this.loading = false;
    });
  }

  obtenerDiasOperacion(event: any): void {
    let grupoLogistico = event.source.value;
    this.formularioDiasOperacion.patchValue({
      diasLogisticos: '',
    });
    this.mensajeSpinner = 'Obteniendo posibles días logísticos';
    this.loading = true;
    const datos = {
      grupo: grupoLogistico,
    };
    this.servicioGestionRutas.obtenerDiasOperacion(datos).subscribe((resp) => {
      if (resp.length == 0) {
        this.loading = false;
        return;
      }
      this.diasOperacion = resp;
      this.loading = false;
    });
  }

  guardarNuevosDiasOperacion(): void {
    this.mensajeSpinner = 'Guardando los nuevos días de operación';
    this.loading = true;
    const { grupoLogistico, diasLogisticos } =
      this.formularioDiasOperacion.value;
    const datos = {
      grupo: grupoLogistico,
      lista_dias: diasLogisticos,
    };
    console.log(datos);

    this.servicioGestionRutas
      .guardarNuevosDiasOperacion(datos)
      .subscribe((resp) => {
        if (!resp) {
          this.loading = false;
          return;
        }
        this.servicioNotificaciones.notificacionExito(resp);
        this.formularioDiasOperacion.reset();
        this.loading = false;
      });
  }

  obtenerInformacionGrupoLogistico(event: any): void {
    let grupoLogistico = event.source.value;
    this.mensajeSpinner = 'Obteniendo información del grupo logístico...';
    this.loading = true;

    const datos = {
      grupo_log: grupoLogistico,
    };
    this.servicioGestionRutas
      .obtenerInformacionGrupoLogistico(datos)
      .subscribe((resp) => {
        if (!resp) {
          this.loading = false;
          return;
        }
        this.formularioEditarEjecutivo.patchValue({
          ejecutivo: resp[0].ejecutivo,
          zona: resp[0].zona,
          linea: resp[0].linea,
          sucursal: resp[0].sucursal,
        });
        this.nombreEjecutivo = resp[0].ejecutivo;
        this.existeGrupo = true;
        this.loading = false;
      });
  }

  guardarNuevoEjecutivo(): void {
    this.mensajeSpinner = 'Guardando nuevo ejecutivo...';
    this.loading = true;
    const { grupoLogistico, ejecutivo } = this.formularioEditarEjecutivo.value;
    const linea = this.formularioEditarEjecutivo.get('linea')?.value;
    const datos = {
      grupo: grupoLogistico,
      linea: linea,
      ejecutivo: ejecutivo,
    };

    this.servicioGestionRutas.guardarNuevoEjecutivo(datos).subscribe((resp) => {
      if (!resp) {
        this.loading = false;
        return;
      }
      this.servicioNotificaciones.notificacionExito(resp);
      this.formularioEditarEjecutivo.reset();
      this.loading = false;
    });
  }

  limpiarFormularios(): void {
    this.formularioGrupoLogistico.reset();
    this.formularioDiasOperacion.reset();
    this.formularioEditarEjecutivo.reset();
    this.diasOperacion.length = 0;
  }
}
