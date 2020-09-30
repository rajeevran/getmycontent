import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './authGuard/auth.guard';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { ResetUserPasswordComponent } from './reset-user-password/reset-user-password.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  
  { path: 'dashboard', component: DashboardComponent, canActivate : [AuthGuard] },

  { path: 'activate-account/:id', component: ActivateAccountComponent },

  { path: 'reset-password/:token', component: ResetUserPasswordComponent },

  { path: '', redirectTo: '/account/login-page', pathMatch: 'full' },

  { path: '**', component: PageNotFoundComponent }
  
  // { path: 'content-manager', component:CmsComponent,canActivate:[AuthGuard]},
];

const config: ExtraOptions = {
  useHash: true,
};

@NgModule({
  imports: [RouterModule.forRoot(routes,config)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
