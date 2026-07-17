import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { NotificacionService } from '../../../shared/services/notificacion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  info = { result: false, rol: '' };

  parentMessage = 'variable de login';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private servicioNotificacion: NotificacionService
  ) {}

  ngOnInit(): void {}

  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  verificarCredenciales() {
    this.loading = true;
    let data = this.loginForm.value;
    this.loginService.login_user(data).subscribe({
      next: (resp) => {
        this.loading = false;
        localStorage.setItem('jwt', resp.jwt);
        if (this.obtener_rol() == 'admin') {
          this.router.navigate(['/informacion']);
        } else {
          this.router.navigate(['/informacion']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.servicioNotificacion.notificacionError(error.error.detail);
      },
    });
  }

  obtener_rol() {
    let user = this.loginForm.value;
    this.loginService.obtener_rol(user).subscribe({
      next: (data) => {
        console.log('Rol desde POST: ' + data.rol);
        return data.rol;
      },
      error: (error) => {
        console.log(error);
      },
    });
    return null;
  }
}
