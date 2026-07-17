import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EdicionPropuestaComponent } from './edicion-propuesta.component';

describe('Componente: EdicionPropuesta', () => {
  let routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientModule],
      declarations: [EdicionPropuestaComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();
  });

  it(`debe crear el componente EdicionPropuesta`, () => {
    const fixture = TestBed.createComponent(EdicionPropuestaComponent);
    const edicionPropuesta = fixture.componentInstance;
    expect(edicionPropuesta).toBeTruthy();
  });
});
