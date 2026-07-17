import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { HomePageComponent } from './core/components/home-page/home-page.component';
import { InicioComponent } from './core/components/inicio/inicio.component';
import { IngresoClientesAntiguosComponent } from './features/modulo-ingreso-datos/components/ingreso-clientes-antiguos/ingreso-clientes-antiguos.component';
import { IngresoClientesNuevosComponent } from './features/modulo-ingreso-datos/components/ingreso-clientes-nuevos/ingreso-clientes-nuevos.component';
import { AsignacionPorModeloComponent } from './features/modulo-asignacion-clientes/components/asignacion-por-modelo/asignacion-por-modelo.component';
import { AsignacionManualComponent } from './features/modulo-asignacion-clientes/components/asignacion-manual/asignacion-manual.component';
import { RevisarRutaComponent } from './features/modulo-gestion-rutas/components/revisar-ruta/revisar-ruta.component';
import { GrupoLogisticoComponent } from './features/modulo-gestion-rutas/components/grupo-logistico/grupo-logistico.component';
import { DarDeBajaComponent } from './features/modulo-gestion-rutas/components/dar-de-baja/dar-de-baja.component';
import { EditarRutaComponent } from './features/modulo-gestion-rutas/components/editar-ruta/editar-ruta.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { PageNotFoundComponent } from './page-not-found.component';

const routes: Routes = [
  //{ path: '**', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: HomePageComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'admin' },
    children: [
      {
        path: 'informacion',
        component: InicioComponent,
      },
      {
        path: 'ingreso-de-datos/clientes-antiguos',
        component: IngresoClientesAntiguosComponent,
      },
      {
        path: 'ingreso-de-datos/clientes-nuevos',
        component: IngresoClientesNuevosComponent,
      },
      {
        path: 'asignacion-de-clientes/asignacion-por-modelo',
        component: AsignacionPorModeloComponent,
      },
      {
        path: 'asignacion-de-clientes/asignacion-manual',
        component: AsignacionManualComponent,
      },
      {
        path: 'gestion-de-rutas/revisar-ruta',
        component: RevisarRutaComponent,
      },
      {
        path: 'gestion-de-rutas/editar-ruta',
        component: EditarRutaComponent,
      },
      {
        path: 'gestion-de-rutas/grupo-logistico',
        component: GrupoLogisticoComponent,
      },
      {
        path: 'gestion-de-rutas/dar-de-baja',
        component: DarDeBajaComponent,
      },
      {
        path: '**',
        redirectTo: 'informacion',
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
