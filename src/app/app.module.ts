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

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

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
    InMemoryWebApiModule.forRoot(InMemoryDataService),
    AppRoutingModule
  ],
  providers: [
    ElectronService, 
    PocketDriveService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
