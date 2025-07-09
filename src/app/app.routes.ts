// routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CreateComponent } from './people/create/create.component';
import { IndexComponent } from '../app/people/index/index.component';
import { AuthGuard } from './services/guards/auth.guards';
import { StatsComponent } from './stats/graphics/graphics.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'people', component: IndexComponent, canActivate: [AuthGuard] },
  { path: 'people/create', component: CreateComponent, canActivate: [AuthGuard] },
  { path: 'people/:id/edit', loadComponent: () => import('./people/edit/edit.component').then(m => m.EditComponent), canActivate: [AuthGuard] },
  { path: 'stats', component: StatsComponent, canActivate: [AuthGuard] },
];
