import {SigninComponent} from './signin/signin.component';
import {SplashComponent} from './splash/splash.component';
import {SelectpdComponent} from './selectpd/selectpd.component';

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'signin/:type/:uuid', component: SigninComponent },
  { path: 'selectpd', component: SelectpdComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}