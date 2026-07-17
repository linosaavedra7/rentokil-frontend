import { TestBed } from '@angular/core/testing';

import { ResultadoOptimizacionComponent } from './resultado-optimizacion.component';

describe('Componente: ResultadoOptimizacion', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      declarations: [ResultadoOptimizacionComponent],
      providers: [],
    }).compileComponents();
  });

  it(`debe crear el componente ResultadoOptimizacion`, () => {
    const fixture = TestBed.createComponent(ResultadoOptimizacionComponent);
    const resultadoOptimizacion = fixture.componentInstance;
    expect(resultadoOptimizacion).toBeTruthy();
  });
});
