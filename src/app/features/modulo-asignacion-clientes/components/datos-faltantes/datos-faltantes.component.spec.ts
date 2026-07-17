import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { DatosFaltantesComponent } from './datos-faltantes.component';

describe('Componente: DatosFaltantes', () => {
  let routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [DatosFaltantesComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();
  });

  it(`debe crear el componente DatosFaltantes`, () => {
    const fixture = TestBed.createComponent(DatosFaltantesComponent);
    const datosFaltantes = fixture.componentInstance;
    expect(datosFaltantes).toBeTruthy();
  });
});
