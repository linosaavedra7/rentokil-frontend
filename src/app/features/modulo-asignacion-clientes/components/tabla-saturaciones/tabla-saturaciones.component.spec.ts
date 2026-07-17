import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { TablaSaturacionesComponent } from './tabla-saturaciones.component';

describe('Componente: TablaSaturaciones', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [TablaSaturacionesComponent],
      providers: [],
    }).compileComponents();
  });

  it(`debe crear el componente TablaSaturaciones`, () => {
    const fixture = TestBed.createComponent(TablaSaturacionesComponent);
    const tablaSaturaciones = fixture.componentInstance;
    expect(tablaSaturaciones).toBeTruthy();
  });
});
