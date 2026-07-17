import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { RevisarRutaComponent } from './revisar-ruta.component';

describe('Componente: RevisarRuta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [RevisarRutaComponent],
      providers: [],
    }).compileComponents();
  });

  it(`debe crear el componente RevisarRuta`, () => {
    const fixture = TestBed.createComponent(RevisarRutaComponent);
    const revisarRuta = fixture.componentInstance;
    expect(revisarRuta).toBeTruthy();
  });
});
