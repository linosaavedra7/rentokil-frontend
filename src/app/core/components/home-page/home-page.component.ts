import { Component, OnInit ,Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';

import decode from 'jwt-decode';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  providers: [LoginService],
})
export class HomePageComponent implements OnInit {
  contenido = '';
  name = '';
  rol = '';
  zonas = []
  url = ""
  isExpanded: boolean = true;
  moduloInicio: boolean = false;
  moduloIngreso: boolean = false;
  moduloAsignacion: boolean = false;
  moduloGestion: boolean = false;

  constructor(
    private router: Router, 
    private loginService: LoginService,
    @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.loginService.getUserInfo().subscribe(
      (data) => {
        //console.log(data)
        this.rol= this.getRol();
        this.contenido = 'Nombre: ' + data.username;
        if(this.rol == 'admin'){
          this.url = this.getUrl()
        }
      },
      (err) => {
        console.log(err);
      }
    );
    this.getNombre()
    this.zonas = this.getZonas()
  }

  moduloSeleccionado(modulo: string): void {
    switch (modulo) {
      case 'inicio':
        this.moduloInicio = !this.moduloInicio;
        this.moduloIngreso = false;
        this.moduloAsignacion = false;
        this.moduloGestion = false;
        break;

      case 'ingreso':
        this.moduloInicio = false;
        this.moduloIngreso = !this.moduloIngreso;
        this.moduloAsignacion = false;
        this.moduloGestion = false;
        break;

      case 'asignacion':
        this.moduloInicio = false;
        this.moduloIngreso = false;
        this.moduloAsignacion = !this.moduloAsignacion;
        this.moduloGestion = false;
        break;

      case 'gestion':
        this.moduloInicio = false;
        this.moduloIngreso = false;
        this.moduloAsignacion = false;
        this.moduloGestion = !this.moduloGestion;
        break;

      default:
        break;
    }
  }

  getNombre(){
    const jwt = localStorage.getItem('jwt') || '';
    const decodetoken: any = decode(jwt);
    this.name = decodetoken.name;
  }

  getRol() {
    const jwt = localStorage.getItem('jwt') || '';
    const decodetoken: any = decode(jwt);
    return decodetoken.rol;
  }

  getZonas(){
    const jwt = localStorage.getItem('jwt') || '';
    const decodetoken: any = decode(jwt);
    return decodetoken.zonas;
  }
  getUrl(){
    const jwt = localStorage.getItem('jwt') || '';
    const decodetoken: any = decode(jwt);
    return decodetoken.url;
  }

  retornarCero(): number {
    return 0;
  }

  logout(): void {
    this.loginService.logout_user().subscribe(
      (data) => {
        //console.log(data)
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  admin(): void {
    let url = environment.baseURL +'/'+ this.url
    //window.open(url, "_blank");  
    this.document.location.href = url
  }
}