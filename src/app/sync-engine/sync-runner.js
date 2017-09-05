import * as _ from 'lodash';

import MetadataDBHandler from '../db/file-metadata-db';
import FileSystemEventListener from './file-system-event-listener';

/**
 * @author Dulaj Atapattu
 */
export class SyncRunner {

    constructor(){
      this.eventListeners = {};
    }

    onPdStart() {

    }

    onPdStop() {

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
        this.eventListeners[username][folderName] = new FileSystemEventListener(username, folderName, []);  // TODO
        this.eventListeners[username][folderName].start();
    }

    removeSyncDirectory(username, folder) {
        this.eventListeners[username][folder].stop();
        delete this.eventListeners[username][folder];
    }
}
