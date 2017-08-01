import 'rxjs/add/operator/switchMap';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import { PocketDrive } from "../models/pocketdrive";
import { PocketDriveService } from "../providers/pd.service";
import { UserService } from "../providers/user.service";
import { UtilsService } from "../providers/utils.service";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  selectedPD: PocketDrive;
  username: string;
  password: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pocketDriveService: PocketDriveService,
    private utilsService: UtilsService,
    private userService: UserService,
    private location: Location
    ) {}

  ngOnInit(): void {
    this.route.paramMap
      .subscribe((params: ParamMap) => this.selectedPD = this.pocketDriveService.getPD(params.get('type'), params.get('uuid')))         
  } 

  goBack(): void {
    this.location.back();
  }  

  signIn(): void {
    this.userService.signIn({username: this.username, password: this.password})
        .then((user)  => { 
            this.utilsService.saveToLocalStorage('user', JSON.stringify(user));
            // this.router.navigate(['home']);
        });
    
    this.router.navigate(['home']);
  } 
  
}