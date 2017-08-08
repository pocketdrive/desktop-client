import 'rxjs/add/operator/switchMap';
import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {Location} from '@angular/common';

import {PocketDrive} from "../models/pocketdrive";
import {PocketDriveService} from "../providers/pd.service";
import {UserService} from "../providers/user.service";
import {LocalStorageService} from "../providers/localstorage.service";
import {MessageHandler} from "../providers/messages";
import {RequesthandlerService} from "../providers/requesthandler.service";
import {HttpInterceptor} from "../providers/http-interceptor.service";

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
              private route: ActivatedRoute,
              private location: Location,
              private pocketDriveService: PocketDriveService,
              private localStorageService: LocalStorageService,
              private userService: UserService,
              private httpInterceptor: HttpInterceptor) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .subscribe((params: ParamMap) => this.selectedPD = this.pocketDriveService.getPD(params.get('type'), params.get('uuid')))
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
            this.localStorageService.addItem('token', JSON.stringify(data.token));
            this.localStorageService.addItem('user', JSON.stringify(data.data.user));
            this.localStorageService.addItem('mount', JSON.stringify(data.data.mount));

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
