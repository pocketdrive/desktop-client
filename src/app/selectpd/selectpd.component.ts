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
              private pocketDriveService: PocketDriveService,
              private localStorageService: LocalStorageService) {
  }

  ngOnInit() {
    var sync_runner_1 = require("../sync-engine/sync-runner");
    var syncRunner = new sync_runner_1.SyncRunner();
    // syncRunner.addNewSyncDirectory('dulaj', 'Documents');
    const hash = require('../sync-engine/sync-actions').getFileChecksum('F:\\Pictures\\1.png');
    console.log(hash);
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
    this.localStorageService.setItem(Constants.localStorageKeys.selectedPd, JSON.stringify(pd));
    this.localStorageService.setItem(Constants.localStorageKeys.networkType, Constants.networkTypes.local);
    this.router.navigate(['signin']);
  }

}
