import { Component, OnInit, Input } from '@angular/core';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-navegacion',
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.css'],
})
export class NavegacionComponent implements OnInit {
  @Input() listaNavegacion!: string[];

  constructor(
    private fileService : FileService,
  ) {}

  ngOnInit(): void {}

  descargar_archivo_modificaciones(){
    this.fileService.descargar_archivo_modificaciones().subscribe(
      (data) => {
        this.administrador_archivo_excel(data,"Modificaciones.xlsx")
      },
      (error) => {
        console.log(error)
      }
    )
  }

  administrador_archivo_excel(response : any, filename : string){

    const dataType = response.type;
    const binaryData = [];
    binaryData.push(response)

    const filePath = window.URL.createObjectURL(new Blob(binaryData,{type : dataType}));
    const downloadLink = document.createElement('a');
    downloadLink.href = filePath
    downloadLink.setAttribute('download',filename)
    document.body.appendChild(downloadLink)
    downloadLink.click()
  }

}
