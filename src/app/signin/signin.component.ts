import 'rxjs/add/operator/switchMap';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import { PocketDrive } from "../models/pocketdrive";
import { PocketDriveService } from "../providers/pd.service";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  selectedPD: PocketDrive;

  constructor(
    private route: ActivatedRoute,
    private pocketDriveService: PocketDriveService,
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
    
  } 
  
}