import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AsignacionManualComponent } from './asignacion-manual.component';

describe('Componente: AsignacionManual', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientModule],
      declarations: [AsignacionManualComponent],
      providers: [],
    }).compileComponents();
  });

  it(`debe crear el componente AsignacionManual`, () => {
    const fixture = TestBed.createComponent(AsignacionManualComponent);
    const asignacionManual = fixture.componentInstance;
    expect(asignacionManual).toBeTruthy();
  });
});
