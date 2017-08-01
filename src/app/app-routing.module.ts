import { SigninComponent } from './signin/signin.component';
import { SplashComponent } from './splash/splash.component';
import { SelectpdComponent } from './selectpd/selectpd.component';
import { HomeComponent } from './home/home.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { SyncComponent } from './sync/sync.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'selectpd', component: SelectpdComponent },
  { path: 'signin/:type/:uuid', component: SigninComponent },
  {
    path: 'home', component: HomeComponent, children: [
      { path: 'explorer', component: ExplorerComponent },
      { path: 'sync', component: SyncComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule {

}