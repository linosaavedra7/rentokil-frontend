import { Component, OnInit } from '@angular/core';
import { AsignacionClientesService } from '../../services/asignacion-clientes.service';
import { diasLogisticos } from '../../../../shared/Constantes';

interface FormatoSaturaciones {
  [key: string]: any;
}

@Component({
  selector: 'app-tabla-saturaciones',
  templateUrl: './tabla-saturaciones.component.html',
  styleUrls: ['./tabla-saturaciones.component.css'],
})
export class TablaSaturacionesComponent implements OnInit {
  saturaciones!: FormatoSaturaciones;
  diasLogisticosOrdenadosPorSemana!: string[];
  matrizSaturacionesPorSemana!: any[][];
  diasLogisticosOrdenadosPorDia!: string[];
  matrizSaturacionesPorDia!: any[][];
  Math: Math = Math;

  tablaSaturacionesPorDiaLogistico: boolean = true;
  tablaSaturacionesPorSemanaLogistica: boolean = false;

  constructor(private servicioAsignacionClientes: AsignacionClientesService) {}

  ngOnInit(): void {
    this.saturaciones = [];
    this.diasLogisticosOrdenadosPorDia = [];
    this.matrizSaturacionesPorDia = [];
    this.diasLogisticosOrdenadosPorSemana = [];
    this.matrizSaturacionesPorSemana = [];
    this.obtenerSaturaciones();
  }

  obtenerSaturaciones(): void {
    this.servicioAsignacionClientes.obtenerSaturaciones().subscribe((resp) => {
      if (resp.length == 0) return;

      this.saturaciones = this.groupBy(resp, 'grupo_log');
      let diasLogisticos = this.groupBy(resp, 'dia_log');
      this.diasLogisticosOrdenadosPorDia = Object.keys(diasLogisticos);
      this.diasLogisticosOrdenadosPorSemana = Object.keys(diasLogisticos)
        .map((s) => s.slice(1).padStart(2, '0') + s[0])
        .sort()
        .map((s) => s[2] + parseInt(s));

      this.crearMatrizSaturacionesPorDiaLogistico();
      this.crearMatrizSaturacionesPorSemanaLogistica();
    });
  }

  groupBy(listaSaturaciones: any[], propiedad: string): any[] {
    return listaSaturaciones.reduce((memo, x) => {
      if (!memo[x[propiedad]]) {
        memo[x[propiedad]] = [];
      }
      memo[x[propiedad]].push(x);
      return memo;
    }, {});
  }

  crearMatrizSaturacionesPorDiaLogistico(): void {
    const listaDias = this.diasLogisticosOrdenadosPorDia;
    const cantidadGruposLogisticos = Object.keys(this.saturaciones).length;
    const cantidadDiasLogisticos = this.diasLogisticosOrdenadosPorDia.length;

    let matrizSaturaciones = Array.from(
      {
        length: cantidadGruposLogisticos,
      },
      () => new Array(cantidadDiasLogisticos + 2).fill('-')
    );

    Object.keys(this.saturaciones)
      .sort()
      .forEach((grupo: string, keyIndex: number) => {
        Object.values(this.saturaciones[grupo]).forEach((info: any) => {
          Object.values(listaDias).forEach((dia: string, index: number) => {
            if (info.dia_log == dia) {
              matrizSaturaciones[keyIndex][0] = info.grupo_log;
              matrizSaturaciones[keyIndex][1] = info.zona;
              matrizSaturaciones[keyIndex][index + 2] = info.saturacion;
            }
          });
        });
      });

    this.matrizSaturacionesPorDia = matrizSaturaciones;
  }

  crearMatrizSaturacionesPorSemanaLogistica(): void {
    const listaDias = this.diasLogisticosOrdenadosPorSemana;
    const cantidadGruposLogisticos = Object.keys(this.saturaciones).length;
    const cantidadDiasLogisticos = this.diasLogisticosOrdenadosPorSemana.length;

    let matrizSaturaciones = Array.from(
      {
        length: cantidadGruposLogisticos,
      },
      () => new Array(cantidadDiasLogisticos + 2).fill('-')
    );

    Object.keys(this.saturaciones)
      .sort()
      .forEach((grupo: string, keyIndex: number) => {
        Object.values(this.saturaciones[grupo]).forEach((info: any) => {
          Object.values(listaDias).forEach((dia: string, index: number) => {
            if (info.dia_log == dia) {
              matrizSaturaciones[keyIndex][0] = info.grupo_log;
              matrizSaturaciones[keyIndex][1] = info.zona;
              matrizSaturaciones[keyIndex][index + 2] = info.saturacion;
            }
          });
        });
      });

    this.matrizSaturacionesPorSemana = matrizSaturaciones;
  }

  esString(dato: string): boolean {
    return typeof dato === 'string';
  }

  esNumero(dato: number): boolean {
    return typeof dato === 'number';
  }

  ordenarTabla(tipo: string): void {
    switch (tipo) {
      case 'dia':
        this.tablaSaturacionesPorDiaLogistico = true;
        this.tablaSaturacionesPorSemanaLogistica = false;
        break;

      case 'semana':
        this.tablaSaturacionesPorDiaLogistico = false;
        this.tablaSaturacionesPorSemanaLogistica = true;
        break;

      default:
        break;
    }
  }
}
