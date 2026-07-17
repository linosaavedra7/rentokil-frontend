import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FileService } from '../../../../shared/services/file.service';

interface ResultadoOptimizacion {
  grupo_logistico: string;
  dia_logistico: string;
  saturacion: number;
  tiempo: number;
  ruta_recorrido: string;
  link_mapa: string;
}

@Component({
  selector: 'app-informacion-asignacion',
  templateUrl: './informacion-asignacion.component.html',
  styleUrls: ['./informacion-asignacion.component.css'],
})
export class InformacionAsignacionComponent implements OnInit {
  @Input() informacionAsignacion: any[] = [];
  @Input() esAsignacionManual: boolean = false;
  @Input() rutas: any[] = [];
  @Input() linkMapa: string = '';

  rutaFinal: string[] = [];

  constructor(
    private router: Router,
    private fileService: FileService,
    ) {}

  ngOnInit(): void {
    console.log(this.informacionAsignacion);
    if (this.esAsignacionManual) {
      return;
    }

    let rutas = this.informacionAsignacion[0].ruta_recorrido.split("',");
    rutas.forEach((ruta: any) => {
      ruta = ruta.replace('[', '');
      ruta = ruta.replace(']', '');
      ruta = ruta.replace("'", '');
      ruta = ruta.replace("'", '');
      this.rutaFinal.push(ruta);
    });
  }

  descargar_archivo_asignacion(){
    this.fileService.descargar_archivo_asignacion().subscribe(
      (data) => {
        this.administrador_archivo_excel(data,"res_descarga.xlsx")
      },
      (error) => {
        console.log(error)
      }
    )
  }

  administrador_archivo_excel(response : any, filename : string){

    const dataType = response.type;
    console.log(dataType)
    const binaryData = [];
    binaryData.push(response)

    const filePath = window.URL.createObjectURL(new Blob(binaryData,{type : dataType}));
    const downloadLink = document.createElement('a');
    downloadLink.href = filePath
    downloadLink.setAttribute('download',filename)
    document.body.appendChild(downloadLink)
    downloadLink.click()
  }

  refrescarPagina(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/asignacion-de-clientes/asignacion-por-modelo']);
    });
  }
}
