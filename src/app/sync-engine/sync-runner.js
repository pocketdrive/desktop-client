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
    // this.eventListeners = {};
    this.username = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser)).username;
    this.ip = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd)).ip;
    this.communicator = new SyncCommunicator(this.username, this.ip);
  }

  async startSync() {
    await MetadataDBHandler.getNextSequenceID().then((result) => {
      FileSystemEventListener.sequenceID = result.data;
    });

    this.communicator = new SyncCommunicator(this.username, this.ip);
    this.fileWatcher = new FileSystemEventListener(this.username, "", []);  // TODO: device ids
    this.fileWatcher.start();

    this.syncInervalId = setInterval(() => {
      if (this.serializeLock === 0 && !FileSystemEventListener.isWatcherRunning) {
        this.doSync();
      }
    }, 2000);

  }

  stopSync() {
    this.fileWatcher.stop();
    clearTimeout(this.syncInervalId);
    this.communicator.closeSocket();
  }

  async doSync() {
    console.log('[SYNC][CLIENT_TO_SERVER]');
    this.serializeLock++;

    await MetadataDBHandler.getChanges().then(async (changes) => {
      changes = changes.data;
      let i = 0;

      const intervalId = setInterval(async () => {
        if (!this.communicator.serverSyncCalled) {
          if (this.communicator.serializeLock === 0) {
            if (i < changes.length) {
              await this.communicator.sendSyncRequest(changes[i++]);
            }
            else {
              // console.log('[SYNC][SERVER_TO_CLIENT]');
              await this.communicator.requestServerToClientSync();
            }
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

}
