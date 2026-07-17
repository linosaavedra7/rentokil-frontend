import { TestBed } from '@angular/core/testing';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { LoginService } from '../../services/login.service';
import { TokenInterceptorService } from '../../services/token-interceptor.service';
import { LoginComponent } from './login.component';

describe('Componente: Login', () => {
  let routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientModule],
      declarations: [LoginComponent],
      providers: [
        LoginService,
        JwtHelperService,
        { provide: Router, useValue: routerSpy },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        // Token interceptor
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptorService,
          multi: true,
        },
      ],
    }).compileComponents();
  });

  it('debe crear el componente login', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const login = fixture.componentInstance;
    expect(login).toBeTruthy();
  });

  it(`debe tener un formulario llamado 'loginForm' con controles vacíos por defecto`, () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const login = fixture.componentInstance;
    const { username, password } = login.loginForm.value;
    expect(login.loginForm).toBeTruthy();
    expect(username).toEqual('');
    expect(password).toEqual('');
  });
});
