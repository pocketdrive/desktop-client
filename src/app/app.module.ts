import 'zone.js';
import 'reflect-metadata';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, RequestOptions, XHRBackend} from '@angular/http';
import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';
import {SigninComponent} from './signin/signin.component';
import {SelectpdComponent} from './selectpd/selectpd.component';
import {SplashComponent} from './splash/splash.component';
import {HomeComponent} from './home/home.component';

import {ElectronService} from './providers/electron.service';
import {PocketDriveService} from './providers/pd.service';
import {UserService} from './providers/user.service';
import {LocalStorageService} from './providers/localstorage.service';
import {ExplorerComponent} from './explorer/explorer.component';
import {SyncClientPdComponent} from './sync-cp/sync-cp.component';
import {SyncPdPdComponent} from './sync-pp/sync-pp.component';
import {SyncService} from "./providers/sync.service";
import {HttpInterceptor} from "./providers/http-interceptor.service";
import {Router} from "@angular/router";
import { MountComponent } from './mount/mount.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SelectpdComponent,
    SplashComponent,
    HomeComponent,
    ExplorerComponent,
    SyncClientPdComponent,
    SyncPdPdComponent,
    MountComponent
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
    LocalStorageService,
    SyncService,
    {
      provide: HttpInterceptor,
      useFactory: (backend: XHRBackend, defaultOptions: RequestOptions, localStorageService: LocalStorageService, router: Router,) => {
        return new HttpInterceptor(backend, defaultOptions, localStorageService, router);
      },
      deps: [XHRBackend, RequestOptions, LocalStorageService, Router]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
