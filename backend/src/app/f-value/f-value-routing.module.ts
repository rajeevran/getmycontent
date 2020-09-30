import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhComponent } from './ph/ph.component';
import { StorageComponent } from './storage/storage.component';
import { ProductComponent } from './product/product.component';
import { AuthGuard } from '../authGuard/auth.guard';




const routes: Routes = 
[
    { path: '', redirectTo: 'login-page', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FValueRoutingModule { }
