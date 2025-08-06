import { Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';

import { IndexComponent } from './pages/practica 1 personas/people/index/index.component';
import { CreateComponent } from './pages/practica 1 personas/people/create/create.component';

import { HomeComponent } from './pages/home/home.component';
import { BattleshipHomeComponent } from './pages/practica-3-batalla-naval/pages/battleship-home/battleship-home.component';
import { JoinGameComponent } from './pages/join-game/join-game.component';
import { LobbyComponent } from './pages/practica-3-batalla-naval/pages/lobby-battleship/lobby.component';
import { GameComponent } from './pages/practica-3-batalla-naval/pages/game/game.component';

import { StatComponent } from './stats/graphics/graphics.component';
import { AuthGuard } from './services/guards/auth.guards';

import { StatsComponent } from './pages/practica-3-batalla-naval/pages/stats/stats.component';
import { SimonsayHomeComponent } from './pages/practica-4-simon-say/pages/simonsay-home/simonsay-home.component';
import { JoinSimonsayComponent } from './pages/practica-4-simon-say/pages/join-simonsay/join-simonsay.component';
import { LobbySimonsayComponent } from './pages/practica-4-simon-say/pages/lobby-simonsay/lobby-simonsay.component';
import { GameComponent as SimonSayGameComponent } from './pages/practica-4-simon-say/pages/game/game.component';

import { LoteriaHomeComponent } from './pages/practica-5-loteria/pages/loteria-home/loteria-home.component';
import { LobbyLoteriaComponent } from './pages/practica-5-loteria/pages/lobby-loteria/lobby-loteria.component';
import { LoteriaGameComponent } from './pages/practica-5-loteria/pages/loteria-game/loteria-game.component';

export const routes: Routes = [
  { path: '', redirectTo: 'people', pathMatch: 'full' },

  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Práctica 1 — Personas
  { path: 'people',         component: IndexComponent,  canActivate: [AuthGuard] },
  { path: 'people/create',  component: CreateComponent, canActivate: [AuthGuard] },
  {
    path: 'people/:id/edit',
    loadComponent: () =>
      import('./pages/practica 1 personas/people/edit/edit.component').then(m => m.EditComponent),
    canActivate: [AuthGuard],
  },
  // Nuevas rutas para estadísticas y logs de personas
  {
    path: 'people/stats',
    loadComponent: () =>
      import('./pages/practica 1 personas/people/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'people/logs',
    loadComponent: () =>
      import('./pages/practica 1 personas/people/logs/logs.component').then(m => m.LogsComponent),
    canActivate: [AuthGuard],
  },

  // Práctica 2 — Estadísticas (esta parece ser otra cosa diferente)
  { path: 'stats', component: StatComponent, canActivate: [AuthGuard] },

  // Práctica 3 — Batalla Naval
  { path: 'games', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'games/battleship', component: BattleshipHomeComponent, canActivate: [AuthGuard]},
  { path: 'games/battleship/join',  component: JoinGameComponent, canActivate: [AuthGuard]},
  { path: 'games/battleship/lobby', component: LobbyComponent, canActivate: [AuthGuard] },
  { path: 'games/battleship/game',  component: GameComponent, canActivate: [AuthGuard] },
  { path: 'games/battleship/stats', component: StatsComponent, canActivate: [AuthGuard] },

  { path: 'games/simonsay', component: SimonsayHomeComponent, canActivate: [AuthGuard] },
  { path: 'games/simonsay/join', component: JoinSimonsayComponent, canActivate: [AuthGuard] },
  { path: 'games/simonsay/lobby', component: LobbySimonsayComponent, canActivate: [AuthGuard] },
  { path: 'games/simonsay/game', component: SimonSayGameComponent, canActivate: [AuthGuard] },

  { path: 'games/loteria', component: LoteriaHomeComponent, canActivate: [AuthGuard] },
  { path: 'games/loteria/lobby', component: LobbyLoteriaComponent, canActivate: [AuthGuard] },
  { path: 'games/loteria/game', component: LoteriaGameComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];
