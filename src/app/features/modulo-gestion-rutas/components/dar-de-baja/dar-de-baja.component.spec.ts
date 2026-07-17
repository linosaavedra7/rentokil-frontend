import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { DarDeBajaComponent } from './dar-de-baja.component';

describe('Componente: DarDeBaja', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [DarDeBajaComponent],
      providers: [],
    }).compileComponents();
  });

  it(`debe crear el componente DarDeBaja`, () => {
    const fixture = TestBed.createComponent(DarDeBajaComponent);
    const darDeBaja = fixture.componentInstance;
    expect(darDeBaja).toBeTruthy();
  });
});
