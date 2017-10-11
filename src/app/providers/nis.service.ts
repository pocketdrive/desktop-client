import {Injectable} from '@angular/core';
import {environment} from "environments";
import {NisFolder} from "../models/nis-folder";
import {HttpInterceptor} from "./http-interceptor.service";
import {Http} from "@angular/http";
import {User} from "../models/user";
import {LocalStorageService} from "./localstorage.service";
import {Constants} from "../constants";
import {PocketDrive} from "../models/pocketdrive";

@Injectable()
export class NisService {

  private url = 'nis/';

  folders: NisFolder[];
  user: User;
  remotePds: PocketDrive[];

  constructor(private http: HttpInterceptor,
              private angularHttp: Http) {
    this.user = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser));

    this.angularHttp
      .post(`${environment.centralServer}/login`, {
        username: this.user.username,
        password: this.user.password
      })
      .toPromise()
      .then((response) => this.remotePds = response.json().device)
      .catch(this.handleError);
  }

  async getNisFolderList(): Promise<NisFolder[]> {
    let message = {type: 'getNisFolders', clientId: environment.deviceId};

    await this.http
      .post(this.url + 'list', JSON.stringify(message))
      .toPromise()
      .then((response) => this.folders = response.json())
      .catch(this.handleError);

    return this.folders;
  }

  setNisFolderList(folders: NisFolder[]): void {
    let message = {type: 'setNisFolders', data: {clientId: environment.deviceId}};
    let syncFolders = [];

    for (let i = 0; i < this.folders; i++) {
      if (this.folders[i].syncDevices.length > 0) {
        syncFolders.push({name: this.folders[i].name, syncDevices: this.folders[i].syncDevices});
      }
    }

    message.data.syncFolders = syncFolders;

    this.http
      .post(this.url + 'set', JSON.stringify(message))
      .toPromise()
      .then((response) => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): void {
    console.error('Error handler [SyncService]', error);
  }

}