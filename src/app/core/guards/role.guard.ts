import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

import decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private login_service: LoginService, public router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const jwt = localStorage.getItem('jwt') || '';

    const decodetoken: any = decode(jwt);
    const rol = decodetoken.rol;
    console.log('Rol desde Token: ' + rol);

    //Cambinar "admin" a rol cuando existan mas vistas
    if (!this.login_service.isAuth() || 'admin' != expectedRole) {
      console.log('Usuario no autorizado para visualizar la vista');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
