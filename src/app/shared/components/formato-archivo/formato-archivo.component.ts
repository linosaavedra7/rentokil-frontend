import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-formato-archivo',
  templateUrl: './formato-archivo.component.html',
  styleUrls: ['./formato-archivo.component.css'],
})
export class FormatoArchivoComponent implements OnInit {
  @Input() columnasArchivo!: string[];

  constructor() {}

  ngOnInit(): void {}
}
