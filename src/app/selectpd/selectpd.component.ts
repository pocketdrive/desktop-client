import path from 'path';
import * as _ from 'lodash';

import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';

import {PocketDrive} from "../models/pocketdrive";
import {PocketDriveService} from "../providers/pd.service";
import {LocalStorageService} from "../providers/localstorage.service";
import {Router} from "@angular/router";
import {Constants} from "../constants";
import {environment} from "environments";

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
    // console.log(pd);
    // pd.uuid = 'f40c2981-7329-40b7-8b04-27f187ae12av';
    // console.log(pd);
    LocalStorageService.setItem(Constants.localStorageKeys.selectedPd, JSON.stringify(pd));
    LocalStorageService.setItem(Constants.localStorageKeys.networkType, JSON.stringify(Constants.networkTypes.local));

    const currentPd: PocketDrive = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd));

    environment['PD_FOLDER_PATH'] = path.resolve(environment.USER_HOME_OF_CLIENT, 'PocketDrive', this.getSanitizedName(currentPd.name)) + path.sep;
    // environment['NIS_DATA_PATH'] = path.resolve(environment.USER_HOME_OF_CLIENT, '.PocketDrive', this.getSanitizedName(currentPd.uuid), 'nis-data') + path.sep;
    environment['NE_DB_PATH_CHECKSUM'] = path.resolve(environment.USER_HOME_OF_CLIENT, '.PocketDrive', this.getSanitizedName(currentPd.name), 'checksum.db');
    environment['NE_DB_PATH_SYNC_METADATA'] = path.resolve(environment.USER_HOME_OF_CLIENT, '.PocketDrive', this.getSanitizedName(currentPd.name), 'sync_metadata.db');

    this.router.navigate(['signin']);
  }

  /**
   * Returns dash(-) separated name
   *
   * @returns {string} Dash(-) separated name
   */
  getSanitizedName(name: string): string {
    let sanitizedName = _.toLower(name);
    sanitizedName = _.join(_.split(sanitizedName, ' '), '-');
    return sanitizedName;
  }

}
