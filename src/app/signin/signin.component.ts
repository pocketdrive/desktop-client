import 'rxjs/add/operator/switchMap';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

import {PocketDrive} from "../models/pocketdrive";
import {UserService} from "../providers/user.service";
import {LocalStorageService} from "../providers/localstorage.service";
import {HttpInterceptor} from "../providers/http-interceptor.service";
import {Constants} from "../constants";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  selectedPD: PocketDrive;
  username: string;
  password: string;

  constructor(private router: Router,
              private location: Location,
              private localStorageService: LocalStorageService,
              private userService: UserService,
              private httpInterceptor: HttpInterceptor) {
  }

  ngOnInit(): void {
    this.selectedPD = this.localStorageService.getItem(Constants.localStorageKeys.selectedPd);
  }

  goBack(): void {
    this.location.back();
  }

  signIn(): void {
    if (this.username == null || this.username.length == 0 || this.password == null || this.password.length == 0) {
      alert('Username or password cannot be empty');
    } else {
      this.userService.signIn(this.username, this.password)
        .then((data) => {
          if (data.success) {
            this.localStorageService.setItem(Constants.localStorageKeys.authToken, data.token);
            this.localStorageService.setItem(Constants.localStorageKeys.loggedInuser, data.data.user);
            this.localStorageService.setItem(Constants.localStorageKeys.mountDetails, data.data.mount);

            this.httpInterceptor.token = data.token;
            this.router.navigate(['home']);

          } else {
            alert('Invalid username or password');
            console.error(data.error);
          }
        });
    }
  }

}
