import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { IngresoClientesNuevosComponent } from './ingreso-clientes-nuevos.component';

describe('Componente: IngresoClientesNuevos', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        MatDialogModule,
      ],
      declarations: [IngresoClientesNuevosComponent],
      providers: [FormBuilder],
    }).compileComponents();
  });

  it(`debe crear el componente IngresoClientesNuevos`, () => {
    const fixture = TestBed.createComponent(IngresoClientesNuevosComponent);
    const ingresoClientesNuevos = fixture.componentInstance;
    expect(ingresoClientesNuevos).toBeTruthy();
  });
});
