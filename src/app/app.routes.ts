import { Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';

import { IndexComponent } from './pages/practica 1 personas/people/index/index.component';
import { CreateComponent } from './pages/practica 1 personas/people/create/create.component';

import { HomeComponent } from './pages/practica-3-batalla-naval/pages/home/home.component';                 // Selector de juego
import { BattleshipHomeComponent } from './pages/practica-3-batalla-naval/pages/battleship-home/battleship-home.component'; // Opciones de Battleship
import { JoinGameComponent } from './pages/practica-3-batalla-naval/pages/join-game/join-game.component';
import { LobbyComponent } from './pages/practica-3-batalla-naval/pages/lobby/lobby.component';
import { GameComponent } from './pages/practica-3-batalla-naval/pages/game/game.component';

import { StatsComponent } from './stats/graphics/graphics.component';
import { AuthGuard } from './services/guards/auth.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

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
  { path: 'stats', component: StatsComponent, canActivate: [AuthGuard] },

  // Práctica 3 — Batalla Naval
  // 1) Selección de juego
  { path: 'games', component: HomeComponent, canActivate: [AuthGuard]},

  // 2) Si elige Battleship, va aquí
  { path: 'games/battleship', component: BattleshipHomeComponent, canActivate: [AuthGuard]},

  // 3) Formularios de join/create/lobby/game
  { path: 'games/battleship/join',  component: JoinGameComponent, canActivate: [AuthGuard]},
  { path: 'games/battleship/lobby', component: LobbyComponent, canActivate: [AuthGuard] },
  { path: 'games/battleship/game',  component: GameComponent, canActivate: [AuthGuard] },

  // Wildcard redirect
  { path: '**', redirectTo: '' },
];
