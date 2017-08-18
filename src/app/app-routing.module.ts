import {SigninComponent} from './signin/signin.component';
import {SplashComponent} from './splash/splash.component';
import {SelectpdComponent} from './selectpd/selectpd.component';
import {HomeComponent} from './home/home.component';
import {ExplorerComponent} from './explorer/explorer.component';
import {SyncClientPdComponent} from './sync-cp/sync-cp.component';
import {SyncPdPdComponent} from './sync-pp/sync-pp.component';

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MountComponent} from "./mount/mount.component";

const routes: Routes = [
  {path: '', component: SplashComponent},
  {path: 'selectpd', component: SelectpdComponent},
  {path: 'signin', component: SigninComponent},
  {
    path: 'home', component: HomeComponent, children: [
    {path: 'explorer', component: ExplorerComponent},
    {path: 'sync-cp', component: SyncClientPdComponent},
    {path: 'sync-pp', component: SyncPdPdComponent},
    {path: 'mount', component: MountComponent}
  ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
