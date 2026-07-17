import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { InformacionAsignacionComponent } from './informacion-asignacion.component';

describe('Componente: InformacionAsignacion', () => {
  let routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      declarations: [InformacionAsignacionComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();
  });

  it(`debe crear el componente InformacionAsignacion`, () => {
    const fixture = TestBed.createComponent(InformacionAsignacionComponent);
    const informacionAsignacion = fixture.componentInstance;
    expect(informacionAsignacion).toBeTruthy();
  });
});
