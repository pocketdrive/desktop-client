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
import {MessageHandler} from "./providers/messages";
import {RequesthandlerService} from "./providers/requesthandler.service";
import {httpFactory} from "@angular/http/src/http_module";

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SelectpdComponent,
    SplashComponent,
    HomeComponent,
    ExplorerComponent,
    SyncClientPdComponent,
    SyncPdPdComponent
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
      useFactory: (backend: XHRBackend, defaultOptions: RequestOptions) => {
        return new HttpInterceptor(backend, defaultOptions);
      },
      deps: [XHRBackend, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
