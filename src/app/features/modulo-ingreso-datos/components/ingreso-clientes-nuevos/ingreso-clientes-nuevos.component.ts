import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { iif, Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { IngresoDatosService } from '../../services/ingreso-datos.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { MapboxService, Feature } from 'src/app/shared/services/mapbox.service';
import { FileService } from 'src/app/shared/services/file.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { MatOption } from '@angular/material/core';
import {
  diasSemana,
  sublineas,
  columnasArchivoRestricciones,
  columnasArchivoNotasVenta,
} from '../../../../shared/Constantes';


@Component({
  selector: 'app-ingreso-clientes-nuevos',
  templateUrl: './ingreso-clientes-nuevos.component.html',
  styleUrls: ['./ingreso-clientes-nuevos.component.css'],
})
export class IngresoClientesNuevosComponent implements OnInit {
  listaNavegacion: string[] = ['1) Ingreso de Datos', 'Clientes Nuevos'];
  ingresoMasivo: boolean = false;
  listaArchivos: File[] = [];

  archivo_notas_venta: any;
  archivo_restricciones: any;
  
  mostrarArchivos: boolean = false;
  archivosValidos: boolean = false;

  loading: boolean = false;
  mensaje = ""

  listaDias = diasSemana;
  listaSemanas = {
    no_aplica: 'No aplica',
    quincena: 'Antes de la quincena',
    ultima_semana: 'Última semana del mes',
  };
  listaSublineas = sublineas;

  datos_cliente: string[] = [];
  dias_logisticos: string[] = [];
  filtro_datos_cliente: Observable<string[]> | undefined;

  datos_visita: string[] = [];
  filtro_datos_visita: Observable<string[]> | undefined;

  datos_servicios: string[] = [];

  nombreArchivoTiemposTeoricos: string = '';
  nombreArchivoRestricciones: string = '';
  estadoPanelTiemposTeoricos: boolean = false;
  estadoPanelRestricciones: boolean = false;

  columnasArchivoRestricciones: string[] = columnasArchivoRestricciones;
  columnasArchivoTiemposTeoricos: string[] = columnasArchivoNotasVenta;

  direcciones: string[] = [];
  coordenadas: string[] = [];
  direccion_selecionada = ""
  coordenada_selecionada = ""

  myControl = new FormControl('');
  options: string[] = []
  //filteredOptions: Observable<string[]> | undefined;

  formularioManual = this.formBuilder.group({
    // Info nota de venta
    notaVenta: ['', Validators.required],
    tipoNotaVenta: ['', Validators.required],

    // Info cliente
    rut: ['', Validators.required],
    nombreFantasia: ['', Validators.required],
    razonSocial: ['', Validators.required],
    direccionLogistica: ['', Validators.required],
    coordenadasDirLog: [],
    //fechaInicio: ['', Validators.required],
    //fechaTermino: ['', Validators.required],

    // Info visitas
    diaLogistico: ['', Validators.required],
    diaPermitido: ['', Validators.required],
    horarioPermitido: ['', Validators.required],
    horarioInicio: ['', Validators.required],
    horarioFinal: ['', Validators.required],
    semanaPermitida: ['', Validators.required],
    restriccionInduccion: ['', Validators.required],

    // Info servicio
    servicios: this.formBuilder.array([]),
    nuevos_servicios: this.formBuilder.array([]),
  });

  formularioMasivo = this.formBuilder.group({
    archivoTiemposTeoricos: ['', Validators.required],
    archivoRestricciones: ['', Validators.required],
  });

  @ViewChild('todoSeleccionado') private todoSeleccionado!: MatOption;


  constructor(
    private formBuilder: FormBuilder,
    private ingresoDatosService: IngresoDatosService,
    private mapboxService: MapboxService,
    private fileService: FileService,
    private matDialog: MatDialog,
    private servicioNotificacion: NotificacionService
  ) {}

  ngOnInit(): void {
    this.filtro_datos_cliente = this.formularioManual.get('rut')?.valueChanges.pipe(
        debounceTime(500),
        map((val) => this.autocompletar_cliente(val))
      );

    /*this.filtro_datos_visita = this.formularioManual.get('diaLogistico')?.valueChanges.pipe(
      debounceTime(500),
      startWith(''),
      map((val) => this.autocompletar_visita(val))
    );*/
    /*this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );*/
    this.agregar_servicios('', '', '');
  }
  /*
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }*/

  limpiarDatos(): void {
    this.formularioManual.reset();
    this.formularioMasivo.reset();
  }

  obtenerNombreArchivoTiemposTeoricos(): void {
    const tiemposTeoricos = this.formularioMasivo.value.archivoTiemposTeoricos;
    this.nombreArchivoTiemposTeoricos = tiemposTeoricos.slice(12);
  }

  obtenerNombreArchivoRestricciones(): void {
    const restricciones = this.formularioMasivo.value.archivoRestricciones;
    this.nombreArchivoRestricciones = restricciones.slice(12);
  }

  retornarCero(): number {
    return 0;
  }

  /*Metodos para autocompletar los campos del formulario*/

  private autocompletar_cliente(value: any): string[] {
    const rut_cliente = value.toLocaleLowerCase();
    console.log(rut_cliente)
    this.existe_cliente(rut_cliente);
    this.datos_cliente = [];
    return [];
  }

  public autocompletar_visita(value: string): string[] {
    for (let i = 0; i < this.dias_logisticos.length; i++) {
      const boton = document.getElementById(
        this.dias_logisticos[i][0]
      ) as HTMLElement;
      boton.style.backgroundColor = '#0076c4';
    }

    const boton = document.getElementById(value[0]) as HTMLElement;
    boton.style.backgroundColor = '#ee161f';

    var nota_venta = this.formularioManual.get('notaVenta')?.value;
    var rut_cliente = this.formularioManual.get('rut')?.value;
    const dia_log = value[0].toLocaleLowerCase();

    //setTimeout(() => {
    if (
      nota_venta != '' &&
      rut_cliente != '' &&
      dia_log != '' &&
      dia_log.length == 2
    ) {
      this.existe_visita(nota_venta, rut_cliente, dia_log);
    }
    //}, 100);
    setTimeout(() => {
      if (this.datos_visita.length != 0) {
        console.log('Visita Encontrada');
        this.formularioManual
          .get('diaPermitido')
          ?.setValue(this.datos_visita[1].split(', '));
        var restriccion_induccion = this.datos_visita[2];
        if (restriccion_induccion != '< 15') {
          this.formularioManual.get('semanaPermitida')?.setValue(['no_aplica']);
        }
        var horario = this.datos_visita[3].split(';');
        this.formularioManual.get('horarioInicio')?.setValue(horario[0]);
        this.formularioManual.get('horarioFinal')?.setValue(horario[1]);

        if (this.datos_visita[4] != 'No') {
          //this.restriccionInduccion.setValue(true)
          this.formularioManual.get('restriccionInduccion')?.setValue(true);
        } else {
          //this.restriccionInduccion.setValue(false)
          this.formularioManual.get('restriccionInduccion')?.setValue(false);
        }
        this.autocompletar_servicios(nota_venta, dia_log);
      }
    }, 500);
    this.datos_visita = [];
    return [];
  }

  private autocompletar_servicios(nota_venta: string, dia_log: string): void {
    if (nota_venta != '' && dia_log != '') {
      this.existe_servicio(nota_venta, dia_log);
    }

    setTimeout(() => {
      if (this.datos_servicios.length != 0) {
        this.limpiar_datos_servicios();
        console.log('Servicios Encontrados');

        for (let i = 0; i < this.datos_servicios.length; i++) {
          var nombre = this.datos_servicios[i][0];
          var cantidad = this.datos_servicios[i][1];
          var sublinea = this.datos_servicios[i][2];
          this.agregar_servicios(nombre, cantidad, sublinea);
        }
      }
    }, 500);
  }

  /*Metodos que recibien informacion de cliente/visita/servicio existente en bd*/

  async existe_cliente(rut_cliente: string) {
    const body = new FormData();
    body.append('rut_cliente', rut_cliente);
    await this.ingresoDatosService.existe_cliente(body).toPromise().then(
      (data) => {
        if (data[0][0] != 'no data') {
          this.datos_cliente = data[0];
          if (this.datos_cliente.length != 0) {
            //console.log('Cliente Encontrado');
            this.formularioManual.get('nombreFantasia')?.setValue(this.datos_cliente[1]);
            this.formularioManual.get('razonSocial')?.setValue(this.datos_cliente[2]);
            this.formularioManual.get('direccionLogistica')?.setValue(this.datos_cliente[3]);
            this.direccion_selecionada = this.datos_cliente[3]
            this.coordenada_selecionada = data[1]
            console.log(this.coordenada_selecionada)
          }
        }
        else{
          this.limpiar_datos_cliente();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async obtener_dias_log(nota_venta: string) {
    const body = new FormData();
    body.append('nota_venta', nota_venta);
    await this.ingresoDatosService.obtener_dias_logisticos(body).toPromise().then(
      (data) => {
        this.dias_logisticos = data;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  async existe_visita(nota_venta: string, rut_cliente: string, dia_log: string) {
    const body2 = new FormData();
    //body2.append('id_compuesta','51676193920-3/3MARCELO MERY AGUIRRE  - VITACURA 6195C3')
    body2.append('nota_venta', nota_venta);
    body2.append('rut_cliente', rut_cliente);
    body2.append('dia_log', dia_log);
    await this.ingresoDatosService.existe_visita(body2).toPromise().then(
      (data) => {
        if (data[0][0] != 'no data') {
          this.datos_visita = data[0];
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  existe_servicio(nota_venta: string, dia_log: string) {
    const body3 = new FormData();
    body3.append('nota_venta', nota_venta);
    body3.append('dia_log', dia_log);
    this.ingresoDatosService.existe_servicio(body3).subscribe(
      (data) => {
        if (data[0][0] != 'no data') {
          this.datos_servicios = data;
        } else {
          this.datos_servicios = [];
          this.limpiar_datos_servicios();
          this.agregar_servicios('', '', '');
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  get servicios() {
    return this.formularioManual.get('servicios') as FormArray;
  }

  get nuevos_servicios() {
    return this.formularioManual.get('nuevos_servicios') as FormArray;
  }

  agregar_servicios(nombre_: string, cantidad_: string, sublinea_: string) {
    const serviciosFormGroup = this.formBuilder.group({
      nombre: nombre_,
      cantidad: cantidad_,
      sublinea: sublinea_,
    });
    this.servicios.push(serviciosFormGroup);
  }

  remover_servicios() {
    if (this.servicios.length != this.datos_servicios.length) {
      this.servicios.removeAt(-1);
      this.remover_nuevos_servicios();
      /*let index = this.nuevos_servicios.length
      for(let i = 0 ; i <= index; i++){
        this.nuevos_servicios.removeAt(-1)
        console.log('eliminando serv: ' + i)
      }*/
    }
  }

  remover_nuevos_servicios() {
    let index = this.nuevos_servicios.length;
    //console.log('cantidad servicios: ' + index)
    for (let i = 0; i < index; i++) {
      this.nuevos_servicios.removeAt(-1);
      //console.log('eliminando serv: ' + i)
    }
  }

  agregar_cliente_manual(): void {

    this.abrir_modal([], true);

    for(let i = 0 ; i < this.direcciones.length; i++){
      if(this.direcciones[i] == this.myControl.value){
        this.coordenada_selecionada = this.coordenadas[i]
      }
    }

    let cant_nuevos_servicios = this.servicios.length - this.datos_servicios.length;

    this.remover_nuevos_servicios();
    for (let i = 0; i < cant_nuevos_servicios; i++) {
      console.log('agregando servicios: ' + this.nuevos_servicios.length);
      let index = this.servicios.length - i - 1;
      const nuevo_servicio = this.formBuilder.group({
        nombre: this.servicios.value[index].nombre,
        cantidad: this.servicios.value[index].cantidad,
        sublinea: this.servicios.value[index].sublinea,
      });
      this.nuevos_servicios.push(nuevo_servicio);
    }

    console.log(this.formularioManual.get('nuevos_servicios')?.value);

    //this.formularioManual.get('direccionLogistica')?.setValue(this.myControl.value)
    this.formularioManual.get('coordenadasDirLog')?.setValue(this.coordenada_selecionada)

    if(this.formularioManual.get('coordenadasDirLog')?.value == ""){
      /* NO SE ENCUENTRA LA COORDENADA DE LA DIRECCION*/
      this.matDialog.closeAll();
      this.servicioNotificacion.notificacionWarning('Selecciona una direccion')
    }
    else{
      const data = this.formularioManual.value;
      this.ingresoDatosService.agregar_cliente_manual(data).subscribe(
        (data) => {
          console.log(data);
          this.matDialog.closeAll();
          this.formularioManual.get('notaVenta')?.setValue('');
          this.formularioManual.get('tipoNotaVenta')?.setValue('');
          this.formularioManual.get('rut')?.setValue('');
          this.limpiar_datos_cliente();
          this.limpiar_datos_visita();
          this.limpiar_datos_servicios();
          this.agregar_servicios('', '', '');
          this.servicioNotificacion.notificacionExito("Servicio(s) agregado(s).")
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
  //(ngModelChange)="search($event)"
  search(event: any) {
    let searchTerm : any;
    if(event != null){
      searchTerm = event.toLowerCase();
    }
    if(event != this.direccion_selecionada){
      this.direccion_selecionada = ""
      this.coordenada_selecionada = ""
    }
    if (searchTerm && searchTerm.length > 0) {
      this.mapboxService.search_word(searchTerm).subscribe((features: Feature[]) => {
        //this.direcciones = features.map((feat) => feat.place_name);
        this.direcciones = features.map(
          (feat) => feat.place_name.split(",")[0] + ", " + feat.place_name.split(",")[1]
        )
        this.options = features.map(
          (feat) => feat.place_name.split(",")[0] + ", " + feat.place_name.split(",")[1]
        )
        this.coordenadas = features.map((feat) => feat.center);
      });
      //console.log(this.direcciones)
      //console.log(this.coordenadas)
    } 
    else {
      this.direcciones = [];
    }
  }

  onSelect(address: string) {
    this.direccion_selecionada = address;
    this.formularioManual.get('direccionLogistica')?.setValue(this.direccion_selecionada);
    for(let i = 0 ; i < this.direcciones.length; i++){
      if(this.direcciones[i] == this.direccion_selecionada){
        this.coordenada_selecionada = this.coordenadas[i]
      }
    }
    //console.log(this.direccion_selecionada)
    //console.log(this.coordenada_selecionada)
    this.direcciones = [];
  }

  /*Metodos para limpiar los campos del formulario*/
  limpiar_datos_cliente(): void {
    this.formularioManual.get('nombreFantasia')?.setValue('');
    this.formularioManual.get('razonSocial')?.setValue('');
    this.formularioManual.get('direccionLogistica')?.setValue('');
    this.formularioManual.get('diaLogistico')?.setValue('');
    this.dias_logisticos = [];
  }

  limpiar_datos_visita(): void {
    this.formularioManual.get('diaPermitido')?.setValue('');
    this.formularioManual.get('semanaPermitida')?.setValue('');
    this.formularioManual.get('horarioInicio')?.setValue('');
    this.formularioManual.get('horarioFinal')?.setValue('');
    //this.restriccionInduccion.setValue(false)
    this.formularioManual.get('restriccionInduccion')?.setValue(false);
  }

  limpiar_datos_servicios(): void {
    this.servicios.controls.splice(0, this.servicios.length);
  }

  /*Metodos para el envio de datos masivo*/

  onFileChange($event: any, nombre: string) {
    if (nombre == 'nota_venta') {
      this.archivo_notas_venta = $event.target.files[0];
    }
    if (nombre == 'restricciones') {
      this.archivo_restricciones = $event.target.files[0];
    }
  }

  async enviar_archivos() {

    let estados:any[] = []

    this.abrir_modal([], true);

    for (let i = 0; i < 2; i++) {
      const body = new FormData();
      if (i == 0) {
        const archivo = this.archivo_notas_venta;
        body.append('file', archivo);
      }
      if (i == 1) {
        const archivo = this.archivo_restricciones;
        body.append('file', archivo);
      }

      await this.fileService.enviar_archivo(body).toPromise().then(
        (data) => {
          estados.push(data.estado)
        },
        (error) => {
          console.log(error)
        }
      )
    }

    let errorArchivos = false
    let msj = ""
    for(let i = 0 ; i < estados.length; i++){
      console.log(estados[i])
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

    this.matDialog.closeAll();

    if(errorArchivos){
      console.log('si hay errores en los archivos')
      this.servicioNotificacion.notificacionWarning(msj) 
    }
    else{
      await this.fileService.buscar_servicios().toPromise().then(
        (data) => {
          this.matDialog.closeAll();
          this.abrir_modal(data, false);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  abrir_modal(informacion_rep: any, load: boolean) {
    this.matDialog.open(ModalComponent, {disableClose: true,
      data: { info: informacion_rep, loading: load },
    });
  }

  seleccionarTodo(): void {
    if (this.todoSeleccionado.selected) {
      let dias = ['L', 'M', 'I', 'J', 'V'];

      this.formularioManual.patchValue({
        diaPermitido: [...dias.map((dia) => dia)],
      });
    } else {
      this.formularioManual.patchValue({
        diaPermitido: '',
      });
    }
  }
}
