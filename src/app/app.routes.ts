import { Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';

import { IndexComponent } from './pages/practica 1 personas/people/index/index.component';
import { CreateComponent } from './pages/practica 1 personas/people/create/create.component';

import { HomeComponent } from './pages/home/home.component';                 // Selector de juego
import { BattleshipHomeComponent } from './pages/practica-3-batalla-naval/pages/battleship-home/battleship-home.component'; // Opciones de Battleship
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

  // Práctica 2 — Estadísticas
  { path: 'stats', component: StatComponent, canActivate: [AuthGuard] },

  // Práctica 3 — Batalla Naval
  // 1) Selección de juego
  { path: 'games', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'games/battleship', component: BattleshipHomeComponent, canActivate: [AuthGuard]},
  { path: 'games/battleship/join',  component: JoinGameComponent, canActivate: [AuthGuard]},
  { path: 'games/battleship/lobby', component: LobbyComponent, canActivate: [AuthGuard] },
  { path: 'games/battleship/game',  component: GameComponent, canActivate: [AuthGuard] },
  { path: 'games/battleship/stats', component: StatsComponent, canActivate: [AuthGuard] },

  // 3) Formularios de join/create/lobby/game

  { path: 'games/simonsay', component: SimonsayHomeComponent, canActivate: [AuthGuard] },
  { path: 'games/simonsay/join', component: JoinSimonsayComponent, canActivate: [AuthGuard] },
  { path: 'games/simonsay/lobby', component: LobbySimonsayComponent, canActivate: [AuthGuard] },
  { path: 'games/simonsay/game', component: SimonSayGameComponent, canActivate: [AuthGuard] },

  // Wildcard redirect
  { path: '**', redirectTo: '' },
];
