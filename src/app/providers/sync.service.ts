import {Injectable} from '@angular/core';
import {Folder} from "../models/folder";
import {HttpInterceptor} from "./http-interceptor.service";
import {environment} from "environments";
import {LocalStorageService} from "./localstorage.service";
import {Constants} from "../constants";
import {SyncRunner} from '../sync-engine/sync-runner';

const _ = require('lodash');
const uuid = require('uuid/v4');

@Injectable()
export class SyncService {

  private url = 'sync/';

  folders: Folder[];
  syncRunner: SyncRunner;

  constructor(private http: HttpInterceptor) {
    // this.init();
  }

  init(): void {
    this.syncRunner = new SyncRunner();
  }

  async getSyncFolderList(): Promise<Folder[]> {
    let message = {type: 'getSyncFolders'};

    await this.http
      .post(this.url + 'list', JSON.stringify(message))
      .toPromise()
      .then((response) => this.folders = response.json())
      .catch(this.handleError);

    // this.saveSyncFoldersToLocalStorage();
    return this.folders;
  }

  setSyncFolderList(foldersList: Folder[]): void {
    // this.saveSyncFoldersToLocalStorage();

    let message = {type: 'setSyncFolders', data: {deviceId: environment.deviceId}};
    let syncFolders = [];

    for (let i = 0; i < foldersList.length; i++) {
      let folder = foldersList[i];

      if (folder.sync) {
        syncFolders.push(folder.name);
      }
    }

    message.data['syncFolders'] = syncFolders;

    this.http
      .post(this.url + 'set', JSON.stringify(message))
      .toPromise()
      .then((response) => response.json())
      .catch(this.handleError);

    // this.syncRunner.refreshSyncDirectories();
  }

  private handleError(error: any): void {
    console.error('Error handler [SyncService]', error);
  }

  /**
   * Save current sync folders list to local storage
   */
  /*saveSyncFoldersToLocalStorage(): void {
    let syncFolders: Folder[] = [];

    for (let i = 0; i < this.folders.length; i++) {
      if (this.folders[i].sync) {
        syncFolders.push(this.folders[i]);
      }
    }

    LocalStorageService.setItem(Constants.localStorageKeys.syncFolders, JSON.stringify(syncFolders));
  }*/

  startSync(): void {
    // let syncFolders = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.syncFolders));
    this.syncRunner.startSync();
  }

  stopSync(): void {
    this.syncRunner.stopSync();
  }

}
