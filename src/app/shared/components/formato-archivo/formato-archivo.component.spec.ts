import { TestBed } from '@angular/core/testing';

import { FormatoArchivoComponent } from './formato-archivo.component';

describe('Componente: FormatoArchivo', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [],
    }).compileComponents();
  });

  it(`debe crear el componente FormatoArchivo`, () => {
    const fixture = TestBed.createComponent(FormatoArchivoComponent);
    const formatoArchivo = fixture.componentInstance;
    expect(formatoArchivo).toBeTruthy();
  });
});
