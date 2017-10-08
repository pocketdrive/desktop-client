import {Injectable, OnInit} from '@angular/core';
import {Folder} from "../models/folder";
import {HttpInterceptor} from "./http-interceptor.service";
import {environment} from "environments";
import {LocalStorageService} from "./localstorage.service";
import {Constants} from "../constants";

const _ = require('lodash');
const uuid = require('uuid/v4');

// const SyncRunner = require('../sync-engine/sync-runner');
import {SyncRunner} from '../sync-engine/sync-runner';
import NisCommunicator from '../communicator/nis-communicator';

@Injectable()
export class SyncService implements OnInit {

  private url = 'sync/';

  folders: Folder[];
  syncRunner: SyncRunner;
  nisCommunicator: NisCommunicator;

  constructor(private http: HttpInterceptor) {
    this.syncRunner = new SyncRunner();
    this.nisCommunicator = new NisCommunicator('1002', '1001', 'dulaj');
    setInterval(() => {
      console.log('NIC called >>>>>>>>>>>>>');
      this.nisCommunicator.requestFileHashes();
    }, 5000);
  }

  ngOnInit() {
  }

  async getSyncFolderList(): Promise<Folder[]> {
    let message = {type: 'getSyncFolders'};

    await this.http
      .post(this.url + 'list', JSON.stringify(message))
      .toPromise()
      .then((response) => this.folders = response.json())
      .catch(this.handleError);

    this.saveSyncFoldersToLocalStorage();
    return this.folders;
  }

  setSyncFolderList(foldersList: Folder[]): void {
    this.saveSyncFoldersToLocalStorage();

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
  }

  private handleError(error: any): void {
    console.error('Error handler [SyncService]', error);
  }

  /**
   * Save current sync folders list to local storage
   */
  saveSyncFoldersToLocalStorage(): void {
    let syncFolders: Folder[] = [];

    for (let i = 0; i < this.folders.length; i++) {
      if (this.folders[i].sync) {
        syncFolders.push(this.folders[i]);
      }
    }

    LocalStorageService.setItem(Constants.localStorageKeys.syncFolders, JSON.stringify(syncFolders));
  }

  startSync(): void {
    let syncFolders = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.syncFolders));
    this.syncRunner.startSync(syncFolders);
  }

  stopSync(): void {
    this.syncRunner.stopSync();
  }

}
