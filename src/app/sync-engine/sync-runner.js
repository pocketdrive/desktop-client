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
    this.serializeLock = 0;
    this.eventListeners = [];
    this.username = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser)).username;
    this.ip = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd)).ip;
  }

  async startSync(syncFolders) {
    await MetadataDBHandler.getNextSequenceID().then((result) => {
      FileSystemEventListener.sequenceID = result.data;
    });

    _.each(syncFolders, (folder) => {
      this.addNewSyncDirectory(this.username, folder.name);
    });

    this.communicator = new SyncCommunicator(this.username, this.ip);

    this.syncInervalId = setInterval(() => {
      if (this.serializeLock === 0 && !FileSystemEventListener.isWatcherRunning) {
        this.doSync();
      }
    }, 2000);

  }

  stopSync() {
    _.each(this.eventListeners, (listener) => {
      listener.stop();
    });

    clearTimeout(this.syncInervalId);
    this.communicator.destroy();
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
    this.eventListeners[folderName] = new FileSystemEventListener(username, folderName, []);  // TODO: device ids
    this.eventListeners[folderName].start();
  }

  removeSyncDirectory(folder) {
    this.eventListeners[folder].stop();
    delete this.eventListeners[folder];
  }

  async doSync() {
    console.log('[SYNC][CLIENT_TO_SERVER]');
    this.serializeLock++;

    await MetadataDBHandler.getChanges().then(async (changes) => {
      changes = changes.data;
      let i = 0;
      let tryCount = 0;

      const intervalId = setInterval(async () => {
        if (!this.communicator.serverSyncCalled) {
          if (this.communicator.serializeLock === 0) {
            tryCount = 0;
            if (i < changes.length) {
              await this.communicator.sendSyncRequest(changes[i++]);
            }
            else {
              console.log('[SYNC][SERVER_TO_CLIENT]');
              await this.communicator.requestServerToClientSync();
            }
          }

          else if (tryCount === 10) {
            this.communicator.serializeLock = 0;
            this.communicator.closeSocket(); // TODO: Have to wait until bigger files are sent completely.
            this.communicator.openSocket();
            i--;
            tryCount = 0;
          }
          else {
            tryCount++;
            console.log('Retrying to sync: ', tryCount);
          }
        }
        else if (this.communicator.serializeLock === 0) {
          clearInterval(intervalId);
          this.communicator.serverSyncCalled = false;
          this.serializeLock--;
        }

      }, 500);

    });
  }

  sleep(milliSeconds) {
    return new Promise(resolve => setTimeout(resolve, milliSeconds));
  }

}
