import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';

import {PocketDrive} from "../models/pocketdrive";
import {PocketDriveService} from "../providers/pd.service";
import {LocalStorageService} from "../providers/localstorage.service";
import {Router} from "@angular/router";
import {Constants} from "../constants";

@Component({
  selector: 'app-selectpd',
  templateUrl: './selectpd.component.html',
  styleUrls: ['./selectpd.component.scss']
})

export class SelectpdComponent implements OnInit {

  constructor(private router: Router,
              private location: Location,
              private pocketDriveService: PocketDriveService) {
  }

  ngOnInit() {
  }

  get localPds(): PocketDrive[] {
    return this.pocketDriveService.localPDs;
  }

  get remotePds(): PocketDrive[] {
    return this.pocketDriveService.remotePDs;
  }

  refresh(): void {
    this.location.back();
  }

  selectLocalPd(pd: PocketDrive): void {
    LocalStorageService.setItem(Constants.localStorageKeys.selectedPd, JSON.stringify(pd));
    LocalStorageService.setItem(Constants.localStorageKeys.networkType, JSON.stringify(Constants.networkTypes.local));
    this.router.navigate(['signin']);
  }

}
