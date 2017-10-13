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

  user: User;
  remotePds: PocketDrive[];
  nisCommunicator: NisCommunicator;
  deviceMap: any = {};
  currentDeviceId: string;

  constructor(private http: HttpInterceptor,
              private angularHttp: Http) {
    this.user = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser));
    this.deviceMap = LocalStorageService.getItem(Constants.localStorageKeys.nisDeviceMap);
    this.currentDeviceId = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd)).uuid.trim();

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
    })
  }

  afterLoadingRemotePds(response) {
    this.remotePds = response.json().device;

    for (let i = 0; i < this.remotePds.length; i++) {
      if (this.remotePds[i].uuid === this.currentDeviceId) {
        this.remotePds.splice(i, 1);
      }
    }
  }

  getNisFolderList(): Promise<NisFolder[]> {
    let message = {type: 'getNisFolders', clientId: environment.deviceId};

    return this.http
      .post(this.url + 'list', JSON.stringify(message))
      .toPromise()
      .then(response => response.json() as NisFolder[])
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

        this.deviceMap[syncFolders[i].syncDevices[j]][this.currentDeviceId] = [this.currentDeviceId];
      }
    }

    LocalStorageService.setItem(Constants.localStorageKeys.nisDeviceMap, this.deviceMap);
  }

  private handleError(error: any): void {
    console.error('Error handler [SyncService]', error);
  }

}
