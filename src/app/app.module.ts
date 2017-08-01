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
import { HomeComponent } from './home/home.component';

import { ElectronService } from './providers/electron.service';
import { PocketDriveService } from './providers/pd.service';
import { UserService } from './providers/user.service';
import { UtilsService } from './providers/utils.service';
import { ExplorerComponent } from './explorer/explorer.component';
import { SyncComponent } from './sync/sync.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SelectpdComponent,
    SplashComponent,
    HomeComponent,
    ExplorerComponent,
    SyncComponent
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
    UserService,
    UtilsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
