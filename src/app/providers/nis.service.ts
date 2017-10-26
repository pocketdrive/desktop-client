import * as _ from 'lodash';

import {Injectable} from '@angular/core';
import {environment} from "environments";
import {NisFolder} from "../models/nis-folder";
import {HttpInterceptor} from "./http-interceptor.service";
import {Http} from "@angular/http";
import {User} from "../models/user";
import {LocalStorageService} from "./localstorage.service";
import {Constants} from "../constants";
import {PocketDrive} from "../models/pocketdrive";

import NisCommunicator from '../communicator/nis-communicator';

@Injectable()
export class NisService {

  private url = 'nis/';

  folders: NisFolder[];
  user: User;
  remotePds: PocketDrive[];
  nisCommunicator: NisCommunicator;
  currentDeviceId: string;

  /**
   * This is the format of the deviceMap. Same value for key and value is used to remove
   * redundant values. If we use an array as the value we have to manually remove redundancies.
   *
   * {
   *  "pd-10001" : { "pd_10002": "pd_10002", "pd_10003": "pd_10003" },
   *  "pd-10002" : { "pd-10001": "pd-10001", "pd-10003": "pd-10003" },
   *  "pd-10003" : { "pd-10001": "pd-10001", "pd-10002": "pd-10002" }
   * }
   *
   */
  deviceMap: any = {};

  constructor(private http: HttpInterceptor,
              private angularHttp: Http) {
    this.user = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser));
    this.deviceMap = LocalStorageService.getItem(Constants.localStorageKeys.nisDeviceMap);
    this.currentDeviceId = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd)).uuid.trim();

    if (!this.deviceMap) {
      this.deviceMap = {};
    }

    // Load all pocketdrives of currently logged in user from the central server
    this.angularHttp
      .post(`${environment.centralServer}/login`, {
        username: this.user.username,
        password: this.user.password
      })
      .toPromise()
      .then((response) => this.afterLoadingRemotePds(response))
      .catch(this.handleError);

    const activeNisMaps = this.deviceMap[this.currentDeviceId];

    _.each(activeNisMaps, (key, deviceId) => {
      let nisCommunicator = new NisCommunicator(this.currentDeviceId, deviceId, this.user.username);
      setInterval(() => {
        console.log(`[NIS][${this.currentDeviceId} --> ${deviceId}]`);

        nisCommunicator.requestFileHashes();
      }, 10000);
    });

  }

  afterLoadingRemotePds(response) {
    this.remotePds = response.json().device;

    for (let i = 0; i < this.remotePds.length; i++) {
      if (this.remotePds[i].uuid === this.currentDeviceId) {
        this.remotePds.splice(i, 1);
      }
    }
  }

  getNisFolderList(): void {
    let message = {type: 'getNisFolders', clientId: environment.deviceId};

    this.http
      .post(this.url + 'list', JSON.stringify(message))
      .toPromise()
      .then(response => this.folders= response.json())
      .catch(this.handleError);
  }

  setNisFolderList(folders: NisFolder[]): void {
    let message = {type: 'setNisFolders', data: {clientId: environment.deviceId}};
    let syncFolders = [];

    for (let i = 0; i < folders.length; i++) {
      if (folders[i].syncDevices && folders[i].syncDevices.length > 0) {
        syncFolders.push({name: folders[i].name, syncDevices: folders[i].syncDevices});
      }
    }

    message.data['syncFolders'] = syncFolders;

    this.http
      .post(this.url + 'set', JSON.stringify(message))
      .toPromise()
      .then((response) => response.json())
      .catch(this.handleError);

    this.updateDeviceMap(syncFolders);
  }

  updateDeviceMap(syncFolders: any[]): void {
    for (let i = 0; i < syncFolders.length; i++) {
      for (let j = 0; j < syncFolders[i].syncDevices.length; j++) {
        if (!this.deviceMap[this.currentDeviceId]) {
          this.deviceMap[this.currentDeviceId] = {};
        }

        this.deviceMap[this.currentDeviceId][syncFolders[i].syncDevices[j]] = syncFolders[i].syncDevices[j];

        if (!this.deviceMap[syncFolders[i].syncDevices[j]]) {
          this.deviceMap[syncFolders[i].syncDevices[j]] = {};
        }

        this.deviceMap[syncFolders[i].syncDevices[j]][this.currentDeviceId] = this.currentDeviceId;
      }
    }

    LocalStorageService.setItem(Constants.localStorageKeys.nisDeviceMap, this.deviceMap);
  }

  private handleError(error: any): void {
    console.error('Error handler [SyncService]', error);
  }

}
