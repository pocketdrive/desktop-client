import 'zone.js';
import 'reflect-metadata';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { SelectpdComponent } from './selectpd/selectpd.component';
import { SplashComponent } from './splash/splash.component';

import { ElectronService } from './providers/electron.service';
import { PocketDriveService } from './providers/pd.service';
import { UserService } from './providers/user.service';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SelectpdComponent,
    SplashComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    ElectronService, 
    PocketDriveService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
