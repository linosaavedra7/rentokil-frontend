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

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private login_service: LoginService, private router: Router) {}

  canActivate(): boolean {
    if (!this.login_service.isAuth()) {
      console.log('Token no valido o expirado');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
