import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileService } from 'src/app/shared/services/file.service';

import { IngresoClientesAntiguosComponent } from './ingreso-clientes-antiguos.component';

describe('Componente: IngresoClientesAntiguos', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, ReactiveFormsModule, FormsModule],
      declarations: [IngresoClientesAntiguosComponent],
      providers: [FileService],
    }).compileComponents();
  });

  it(`debe crear el componente IngresoClientesAntiguos`, () => {
    const fixture = TestBed.createComponent(IngresoClientesAntiguosComponent);
    const ingresoClientesAntiguos = fixture.componentInstance;
    expect(ingresoClientesAntiguos).toBeTruthy();
  });
});
