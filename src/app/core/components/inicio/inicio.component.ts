import { Component, OnInit } from '@angular/core';
import { FileService } from 'src/app/shared/services/file.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(
    private fileService : FileService
  ) { }

  ngOnInit(): void {
  }

  descargar_archivo_manual(){
    this.fileService.descargar_archivo_manual_usuario().subscribe(
      (data) => {
        this.administrador_archivo_excel(data,"Manual_de_Usuario.pdf")
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
