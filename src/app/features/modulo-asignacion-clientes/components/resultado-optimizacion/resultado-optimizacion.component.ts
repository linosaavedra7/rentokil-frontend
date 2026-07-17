import { Component, OnInit, Input } from '@angular/core';

interface MatrizOptimizacion {
  [key: string]: any;
}

@Component({
  selector: 'app-resultado-optimizacion',
  templateUrl: './resultado-optimizacion.component.html',
  styleUrls: ['./resultado-optimizacion.component.css'],
})
export class ResultadoOptimizacionComponent implements OnInit {
  @Input() datosOptimizacion: MatrizOptimizacion[] = [];

  columnasTablaResultado: string[] = [
    'rutero',
    'dia_logistico',
    'saturacion',
    'tiempo',
  ];

  constructor() {}

  ngOnInit(): void {}
}
