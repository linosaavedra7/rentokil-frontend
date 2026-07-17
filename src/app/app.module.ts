import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Modulos Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { LoginComponent } from './core/components/login/login.component';
import { HomePageComponent } from './core/components/home-page/home-page.component';
import { IngresoClientesNuevosComponent } from './features/modulo-ingreso-datos/components/ingreso-clientes-nuevos/ingreso-clientes-nuevos.component';
import { IngresoClientesAntiguosComponent } from './features/modulo-ingreso-datos/components/ingreso-clientes-antiguos/ingreso-clientes-antiguos.component';
import { NavegacionComponent } from './shared/components/navegacion/navegacion.component';
import { FormatoArchivoComponent } from './shared/components/formato-archivo/formato-archivo.component';
import { AsignacionPorModeloComponent } from './features/modulo-asignacion-clientes/components/asignacion-por-modelo/asignacion-por-modelo.component';
import { AsignacionManualComponent } from './features/modulo-asignacion-clientes/components/asignacion-manual/asignacion-manual.component';
import { DatosFaltantesComponent } from './features/modulo-asignacion-clientes/components/datos-faltantes/datos-faltantes.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ResultadoOptimizacionComponent } from './features/modulo-asignacion-clientes/components/resultado-optimizacion/resultado-optimizacion.component';
import { EdicionPropuestaComponent } from './features/modulo-asignacion-clientes/components/edicion-propuesta/edicion-propuesta.component';
import { ModalComponent } from './shared/components/modal/modal.component';

import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { TokenInterceptorService } from './core/services/token-interceptor.service';
import { TablaSaturacionesComponent } from './features/modulo-asignacion-clientes/components/tabla-saturaciones/tabla-saturaciones.component';
import { RevisarRutaComponent } from './features/modulo-gestion-rutas/components/revisar-ruta/revisar-ruta.component';
import { GrupoLogisticoComponent } from './features/modulo-gestion-rutas/components/grupo-logistico/grupo-logistico.component';
import { DarDeBajaComponent } from './features/modulo-gestion-rutas/components/dar-de-baja/dar-de-baja.component';
import { InformacionAsignacionComponent } from './features/modulo-asignacion-clientes/components/informacion-asignacion/informacion-asignacion.component';
import { MapaComponent } from './shared/components/mapa/mapa.component';
import { InicioComponent } from './core/components/inicio/inicio.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { EditarRutaComponent } from './features/modulo-gestion-rutas/components/editar-ruta/editar-ruta.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomePageComponent,
    IngresoClientesNuevosComponent,
    IngresoClientesAntiguosComponent,
    NavegacionComponent,
    FormatoArchivoComponent,
    AsignacionPorModeloComponent,
    AsignacionManualComponent,
    DatosFaltantesComponent,
    SpinnerComponent,
    ResultadoOptimizacionComponent,
    EdicionPropuestaComponent,
    ModalComponent,
    TablaSaturacionesComponent,
    RevisarRutaComponent,
    GrupoLogisticoComponent,
    DarDeBajaComponent,
    InformacionAsignacionComponent,
    MapaComponent,
    InicioComponent,
    PageNotFoundComponent,
    EditarRutaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatListModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatTableModule,
    MatExpansionModule,
    MatTabsModule,
    MatDialogModule,
  ],
  providers: [
    // JWT
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    // Token interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    JwtHelperService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
