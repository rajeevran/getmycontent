import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FValueRoutingModule } from './f-value-routing.module';
import { ProductComponent } from './product/product.component';
import { PhComponent } from './ph/ph.component';
import { StorageComponent } from './storage/storage.component';
import { ReactiveFormsModule} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';


@NgModule({
  declarations: [ProductComponent, PhComponent, StorageComponent],
  imports: [
    CommonModule,
    FValueRoutingModule,
    FormsModule,
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.wanderingCubes,
      backdropBackgroundColour: 'rgba(0,0,0,0.1)', 
      backdropBorderRadius: '4px',
      primaryColour: '#ffffff', 
      secondaryColour: '#ffffff', 
      tertiaryColour: '#ffffff'
  }),
    ReactiveFormsModule
  ]
})
export class FValueModule { }
