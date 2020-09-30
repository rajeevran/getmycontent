import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 import { LoginPageComponent } from './login-page/login-page.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ViewUserFeedComponent } from './view-user-feed/view-user-feed.component';
import { AuthGuard } from '../authGuard/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: 'login-page', pathMatch: 'full' },
  { path: 'login-page', component: LoginPageComponent  },
  { path: 'change-password', component: ChangePasswordComponent, canActivate : [AuthGuard] },
  { path: 'view-user-feed', component: ViewUserFeedComponent, canActivate : [AuthGuard] }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
