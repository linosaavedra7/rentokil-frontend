import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GestionRutasService } from '../../services/gestion-rutas.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { columnasArchivoDarDeBajaMasivo } from '../../../../shared/Constantes';
import { FileService } from 'src/app/shared/services/file.service';

import Swal from 'sweetalert2';

import { MatTableDataSource } from '@angular/material/table';

interface Servicio {
  id: number;
  nombre: string;
  cantidad: number;
  dia_log: string;
  grupo_log: string;
  rut_cliente: string;
  nom_cliente: string;
}

interface Visita {
  rut_cliente: string;
  nom_cliente: string;
  direccion: string;
  grupo_log: string;
  dia_log: string;
}

@Component({
  selector: 'app-dar-de-baja',
  templateUrl: './dar-de-baja.component.html',
  styleUrls: ['./dar-de-baja.component.css'],
})
export class DarDeBajaComponent implements OnInit {
  listaNavegacion: string[] = ['3) Gestión de rutas', 'Dar de baja'];

  columnasTablaServicios: string[] = [
    'select',
    'id',
    'nombre',
    'cantidad',
    'dia_log',
    'grupo_log',
    'rut_cliente',
    'nom_cliente',
  ];
  columnasTablaVisitas: string[] = [
    'rut_cliente',
    'nom_cliente',
    'direccion',
    'grupo_log',
    'dia_log',
  ];
  columnasArchivoDarDeBajaMasivo = columnasArchivoDarDeBajaMasivo;

  notaVenta?: number;
  notaVentaIngresada?: number;
  mensajeSpinner: string = '';

  idServicio!: number;
  listaServicios: Servicio[] = [];
  seleccionServicio = new SelectionModel<Servicio>(false);

  idVisita!: number;
  listaVisitas!: MatTableDataSource<Visita>;
  //listaVisitas: Visita[] = [];
  seleccionVisita = new SelectionModel<Visita>(false);

  nombreArchivo: string = '';
  archivo_notas_venta : any;

  estadoPanelEliminacionMasiva: boolean = false;
  mostrarTablaServicios: boolean = false;
  mostrarTablaVisitas: boolean = false;
  disable: boolean = true;
  loading: boolean = false;

  constructor(
    private servicioGestionRutas: GestionRutasService,
    private servicioNotificacion: NotificacionService,
    private fileService: FileService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/gestion-de-rutas/dar-de-baja']);
    });
  }

  notificacionConfirmacion(tipo: string): void {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: 'No se podrá revertir la eliminación',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0076c4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        switch (tipo) {
          case 'servicio':
            this.eliminarServicio();
            break;

          case 'visita':
            this.eliminarVisita();
            break;

          default:
            break;
        }
      }
    });
  }

  obtenerNombreArchivoEliminacionMasiva(event: any): void {
    const nombre = event.target.value;
    this.nombreArchivo = nombre.slice(12);
  }

  obtenerServiciosNotaVenta(): void {
    this.loading = true;
    this.mensajeSpinner = 'Cargando servicios...';
    this.notaVentaIngresada = this.notaVenta;
    const datos = {
      nv: this.notaVentaIngresada,
    };
    console.log(datos);
    this.servicioGestionRutas
      .obtenerServiciosNotaVenta(datos)
      .subscribe((resp) => {
        if (resp.length == 0) {
          this.listaServicios = resp;
          this.mostrarTablaServicios = false;
          this.servicioNotificacion.notificacionError(
            'No se encontraron servicios para esa nota de venta'
          );
          this.loading = false;
          return;
        }
        this.listaServicios = resp;
        this.loading = false;
        this.mostrarTablaServicios = true;
      });
  }

  obtenerServicioSeleccionado(): void {
    if (!this.seleccionServicio.isEmpty()) {
      this.idServicio = this.seleccionServicio.selected[0].id;
    }
  }

  eliminarServicio(): void {
    this.loading = true;
    this.mensajeSpinner = 'Eliminando servicio...\n(Esto puede tardar unos minutos)';
    const datos = {
      id_servicio: this.idServicio,
    };

    this.servicioGestionRutas.eliminarServicio(datos).subscribe((resp) => {
      if (resp == false) {
        this.loading = false;
        this.refrescarPagina();
        return;
      }
      this.servicioNotificacion.notificacionExito(resp);
      this.listaServicios = this.listaServicios.filter(
        (servicio) => servicio.id !== this.idServicio
      );
      this.seleccionServicio.clear();
      this.loading = false;
    });
  }

  obtenerVisitasNotaVenta(): void {
    this.loading = true;
    this.mensajeSpinner = 'Cargando visitas...';
    let visitas: Visita[] = [];
    this.notaVentaIngresada = this.notaVenta;

    const datos = {
      nv: this.notaVentaIngresada,
    };
    this.servicioGestionRutas
      .obtenerVisitasNotaVentaDarDeBaja(datos)
      .subscribe((resp) => {
        if (resp.length == 0) {
          visitas[0] = resp;
          this.listaVisitas = new MatTableDataSource(visitas);
          this.servicioNotificacion.notificacionError(
            'No se encontraron visitas para esa nota de venta.'
          );
          this.loading = false;
          return;
        }
        visitas[0] = resp;
        this.listaVisitas = new MatTableDataSource(visitas);
        //console.log(this.visitasNV);

        this.loading = false;
        this.mostrarTablaVisitas = true;
      });
  }

  eliminarVisita(): void {
    this.loading = true;
    this.mensajeSpinner = 'Dando de baja a nota de venta...\n(Esto puede tardar unos minutos)';
    const datos = {
      nv: this.notaVenta,
    };

    this.servicioGestionRutas.eliminarVisitas(datos).subscribe((resp) => {
      if (resp == false) {
        this.loading = false;
        this.refrescarPagina();
        return;
      }
      this.servicioNotificacion.notificacionExito(resp);
      this.mostrarTablaVisitas = false;
      this.notaVenta = undefined;
      this.loading = false;
    });
  }

  onFileChange($event: any) {
    this.archivo_notas_venta = $event.target.files[0]
  }

  async enviar_archivos_eliminar(){

    this.loading = true
    this.mensajeSpinner = "Cargando..."

    const body = new FormData();
    const archivo = this.archivo_notas_venta
    body.append('file',archivo)
    console.log(archivo.name)
    console.log(archivo.size)

    let estado : any;

    await this.fileService.enviar_archivo_eliminar(body).toPromise().then(
      (data) => {
        console.log(data.estado)
        estado = data.estado[1]
      },
      (error) => {
        console.log(error)
      }
    )

    //estado = false

    this.loading = false

    if(estado){
      console.log("archivo sin error")
      this.servicioNotificacion.notificacionExito('Nota(s) de venta eliminada(s)')

    }
    else{
      console.log("archivo con error")
      this.servicioNotificacion.notificacionWarning('Revisar formato del archivo')
    }
  }

  limpiarDatos(): void {
    this.notaVenta = undefined;
    this.listaServicios.length = 0;
    //this.listaVisitas.data.length = 0;
    this.mostrarTablaServicios = false;
    this.mostrarTablaVisitas = false;
  }
}
