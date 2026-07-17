import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { LoginService } from '../../services/login.service';
import { TokenInterceptorService } from '../../services/token-interceptor.service';

import { HomePageComponent } from './home-page.component';

describe('Componente: Homepage', () => {
  let routerSpy = jasmine.createSpy('navigate');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [HomePageComponent],
      providers: [
        LoginService,
        { provide: Router, useValue: routerSpy },
        JwtHelperService,
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

  it('debe crear el componente homepage', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    const homepage = fixture.componentInstance;
    expect(homepage).toBeTruthy();
  });
});
