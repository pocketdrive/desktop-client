import * as _ from 'lodash';

import FileSystemEventListener from './file-system-event-listener';
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";
import {SyncCommunicator} from '../communicator/sync-communicator';
import MetadataDBHandler from "../db/file-metadata-db";

/**
 * @author Dulaj Atapattu
 */
export class SyncRunner {

  constructor() {
    this.eventListeners = [];
    this.username = LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser).username;
    this.ip = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd)).ip;
  }

  async startSync(syncFolders) {
    _.each(syncFolders, (folder) => {
      this.addNewSyncDirectory(this.username, folder.name);
    });

    this.communicator = new SyncCommunicator(this.username, this.ip);

    /*while (true){
      this.doSync();
      await this.sleep(2000);
    }*/

    this.doSync();
  }

  stopSync() {

  }

  onClientConnect(username) {

  }

  onClientDisconnect(username) {

  }

  scanMetadataDBForChanges(username) {
    /*MetadataDBHandler.getUpdatedFilesOfUser(username).then((updates) => {
        _.each(updates, (update) => {
            switch (update.action) {
                case SyncEvents.NEW:
                    break;
                case SyncEvents.MODIFY:
                    break;
                case SyncEvents.RENAME:
                    break;
                case SyncEvents.DELETE:
                    break;
            }

        })
    })*/
  }

  addNewSyncDirectory(username, folderName) {
    this.eventListeners[folderName] = new FileSystemEventListener(username, folderName, []);  // TODO
    this.eventListeners[folderName].start();
  }

  removeSyncDirectory(folder) {
    this.eventListeners[folder].stop();
    delete this.eventListeners[folder];
  }

  doSync() {
    console.log("Sync called");
    MetadataDBHandler.getChanges().then(async (changes) => {
      changes = changes.data;
      let i = 0;
      let tryCount = 0;

      const intervalId = setInterval(async () => {
        console.log('lock: ', this.communicator.serializeLock);

        if (this.communicator.serializeLock === 0) {
          tryCount = 0;
          if (i < changes.length) {
            await this.communicator.sendSyncRequest(changes[i++]);
          }
          else {
            clearInterval(intervalId);
          }
        }
        else if (tryCount === 10) {
          this.communicator.serializeLock = 0;
          this.communicator = new SyncCommunicator(this.username, this.ip);
          i--;
          tryCount = 0;
        }
        else {
          tryCount++;
        }

      }, 500);

      /*for (let i = 0; i < changes.length; i++) {
        await this.communicator.sendSyncRequest(changes[i]);
      }*/
    });
  }

  sleep(milliSeconds) {
    return new Promise(resolve => setTimeout(resolve, milliSeconds));
  }

}
