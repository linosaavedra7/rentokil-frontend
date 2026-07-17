import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { GrupoLogisticoComponent } from './grupo-logistico.component';

describe('Componente: AgregarGrupoLogistico', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, ReactiveFormsModule],
      declarations: [GrupoLogisticoComponent],
      providers: [],
    }).compileComponents();
  });

  it(`debe crear el componente AgregarGrupoLogistico`, () => {
    const fixture = TestBed.createComponent(GrupoLogisticoComponent);
    const agregarGrupoLogistico = fixture.componentInstance;
    expect(agregarGrupoLogistico).toBeTruthy();
  });
});
