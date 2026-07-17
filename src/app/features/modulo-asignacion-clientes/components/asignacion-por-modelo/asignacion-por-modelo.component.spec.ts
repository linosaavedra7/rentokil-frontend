import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AsignacionPorModeloComponent } from './asignacion-por-modelo.component';

describe('Componente: AsignacionPorModelo', () => {
  let routerSpy = { navigate: jasmine.createSpy('navigate') };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientModule],
      declarations: [AsignacionPorModeloComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();
  });

  it(`debe crear el componente AsignacionPorModelo`, () => {
    const fixture = TestBed.createComponent(AsignacionPorModeloComponent);
    const asignacionPorModelo = fixture.componentInstance;
    expect(asignacionPorModelo).toBeTruthy();
  });
});
