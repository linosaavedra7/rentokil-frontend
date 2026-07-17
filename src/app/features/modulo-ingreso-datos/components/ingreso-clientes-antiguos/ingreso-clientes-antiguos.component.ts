import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FileService } from '../../../../shared/services/file.service';
import { IngresoDatosService } from '../../services/ingreso-datos.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import {
  columnasArchivoNotasVenta,
  columnasArchivoRestricciones,
  columnasArchivoGruposLogisticos,
} from '../../../../shared/Constantes';
@Component({
  selector: 'app-ingreso-clientes-antiguos',
  templateUrl: './ingreso-clientes-antiguos.component.html',
  styleUrls: ['./ingreso-clientes-antiguos.component.css'],
})
export class IngresoClientesAntiguosComponent implements OnInit {
  listaNavegacion: string[] = ['1) Ingreso de Datos', 'Clientes Antiguos'];
  listaArchivos: File[] = [];

  archivo_notas_venta: any;
  archivo_restricciones: any;
  archivo_grupos: any;

  archivosExisten: string[] = [];
  mostrarArchivos: boolean = false;
  archivosValidos: boolean = false;
  loading: boolean = false;
  mensaje = ""

  nombreArchivoNotaVentas: string = '';
  nombreArchivoRestricciones: string = '';
  nombreArchivoGruposLogisticos: string = '';
  estadoPanelNotaVenta: boolean = false;
  estadoPanelRestricciones: boolean = false;
  estadoPanelGruposLogisticos: boolean = false;

  columnasArchivoNotaVentas: string[] = columnasArchivoNotasVenta;
  columnasArchivoRestricciones: string[] = columnasArchivoRestricciones;
  columnasArchivoGruposLogisticos: string[] = columnasArchivoGruposLogisticos;

  constructor(
    private fileService: FileService,
    private formBuilder: FormBuilder,
    private servicioIngresoDatos: IngresoDatosService,
    private servicioNotificacion: NotificacionService,
    private matDialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  formularioMasivo = this.formBuilder.group({
    archivoNotaVenta: ['', Validators.required],
    archivoRestricciones: ['', Validators.required],
    archivoGruposLogisticos: ['', Validators.required],
  });

  onFileChange($event: any, nombre : string) {
    if (nombre == 'nota_venta') {
      this.archivo_notas_venta = $event.target.files[0];
    }
    if (nombre == 'restricciones') {
      this.archivo_restricciones = $event.target.files[0];
    }
    if (nombre == 'grupos'){
      this.archivo_grupos = $event.target.files[0]
    }
  }

  obtenerNombreArchivoNotaVentas() {
    const notaVenta = this.formularioMasivo.value.archivoNotaVenta;
    this.nombreArchivoNotaVentas = notaVenta.slice(12);
  }

  obtenerNombreArchivoRestricciones() {
    const restricciones = this.formularioMasivo.value.archivoRestricciones;
    this.nombreArchivoRestricciones = restricciones.slice(12);
  }

  obtenerNombreArchivoGruposLogisticos() {
    const gruposLogisticos = this.formularioMasivo.value.archivoGruposLogisticos;
    this.nombreArchivoGruposLogisticos = gruposLogisticos.slice(12);
  }

  async enviar_archivo() {

    this.abrir_modal([], true,"");

    let estados:any[] = []
    let existen:any[] = []
    let estado2:any[] = []

    for(let i = 0 ; i < 3 ; i++){
      const body = new FormData();
      if (i == 0) {
        const archivo = this.archivo_notas_venta;
        body.append('file', archivo);
      }
      if (i == 1) {
        const archivo = this.archivo_restricciones;
        body.append('file', archivo);
      }
      if (i == 2){
        const archivo = this.archivo_grupos;
        body.append('file',archivo);
      }
      await this.fileService.enviar_archivo(body).toPromise().then(
        (data) => {
          estados.push(data.estado)
          existen.push(data.existia)
          if(data.estado[0] == "Notas de Venta" && data.estado[1] == true && data.existia){
            estado2 = data.estado2
          }
        },
        (error) =>{
          console.log(error)
        }
      );
    }

    /*Se construye el mensaje cuando el formato de los archivo es invalido*/
    let errorArchivos = false
    let msj = ""
    for(let i = 0 ; i < estados.length; i++){
      //console.log(estados[i])
      if(estados[i][1] == false){
        errorArchivos = true
        //this.loading = false
        if(estados[i][2] == 1){
          msj += "*Falta(n) columna(s) en el archivo"
          msj += ' "'+ estados[i][0] +'": '
          msj += "["+ estados[i][3] + "]"
        }
        else{
          msj += "*Columna(s) mal escrita(s) en archivo"
          msj += ' "'+ estados[i][0] +'": '
          msj += "["+ estados[i][3] + "]"
        } 
      }
    }

    /*Se construye el mensaje cuando el contenido de "Nota de Venta" es invalido
    Si es la primera vez que se sube informacion se omite este mensaje
    Solo se considera cuando no es primera vez que se suben los archivos*/
    let msj2 = ""
    if (estado2.length > 0) {
      console.log(estado2)
      if(!estado2[0]){
        msj2 += "Notas de ventas aun no han sido asignadas, "
      }
      if(!estado2[1]){
        msj2 += "Grupos logisticos no estan activos, "
      }
      if(!estado2[2]){
        msj2 += "Dias de grupo logistico no estan activos, "
      }
      if(!estado2[3]){
        msj2 += "Notas de venta ya existen en el sistema."
      }
    }

    this.matDialog.closeAll();

    function onlyUnique(value : any, index : any, self : any) {
      return self.indexOf(value) === index;
    }
    
    var existe = existen.filter(onlyUnique)

    if(errorArchivos){
      console.log('si hay errores en los archivos')
      this.servicioNotificacion.notificacionWarning(msj) 
    }
    else{
      console.log('no hay errores en los archivos')
      if(!existe[0]){
        console.log('los archivos no existian')
        //METODO QUE DURA MUCHO TIEMPO (PRIMERA VEZ QUE SE AGREGAN LOS DATOS)
        this.abrir_modal([], true,"");
        /*Una vez subido los archivos por primera vez a temporales se pasan a finales*/
        await this.servicioIngresoDatos.agregar_cliente_masivo_primera().toPromise().then(
          (data) => {
            console.log(data)
          },
          (error) => {
            console.log(error)
          }
        )
        /*Teniendo los archivos en finales, se ingresa la informacion completa a la base de adtos*/
        await this.servicioIngresoDatos.guardarDatos().toPromise().then(
          (data) => {
            this.matDialog.closeAll();
            this.servicioNotificacion.notificacionExito(data);
          },
          (error) => {
            this.matDialog.closeAll();
            this.servicioNotificacion.notificacionError(error.message);
          }
        );
        this.formularioMasivo.reset();
        this.nombreArchivoNotaVentas = '';
        this.nombreArchivoRestricciones = '';
        this.nombreArchivoGruposLogisticos = '';
      }
      else{
        console.log('los archivos existian')
        var estado_2 = estado2.filter(onlyUnique)
        if(estado_2.length == 1){
          if(estado_2[0]){
            console.log('no hay problemas con el archivo base de datos [true]')
            this.abrir_modal([], false,'antiguo');
          }
          else{
            console.log('hay problemas con el archivo base de datos [false]')
            this.servicioNotificacion.notificacionWarning(msj2)
          }
        }
        else{
          console.log('hay problemas con el archivo base de datos [true,false]')
          this.servicioNotificacion.notificacionWarning(msj2)
        }
      }
    }
  }

  abrir_modal(informacion_rep: any, load: boolean, tipo : string) {
    this.matDialog.open(ModalComponent, { disableClose: true,
      data: { info: informacion_rep, loading: load, tipoCliente : tipo },
    });
  }

}
