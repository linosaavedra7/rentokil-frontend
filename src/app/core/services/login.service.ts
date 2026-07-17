import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  login_user(userData: any): Observable<any> {
    return this.http.post(`${environment.baseURL}/login/`, userData, {
      withCredentials: true,
    });
  }

  obtener_rol(userData: any): Observable<any> {
    const body = { user: userData.username, pass: userData.password };
    return this.http.post(`${environment.baseURL}/autenticar_usuario/`, body, {
      headers: this.httpHeaders,
    });
  }

  logout_user(): Observable<any> {
    return this.http.post(`${environment.baseURL}/logout/`, {
      withCredencials: true,
    });
  }

  isAuth(): boolean {
    const jwt = localStorage.getItem('jwt') || '';
    if (this.jwtHelper.isTokenExpired(jwt) || !localStorage.getItem('jwt')) {
      return false;
    }
    return true;
  }

  getUserInfo(): Observable<any> {
    return this.http.get(`${environment.baseURL}/user/`, {
      withCredentials: true,
    });
  }

}
