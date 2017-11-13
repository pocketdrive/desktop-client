import {SyncEvents} from "./sync-constants";

import fsmonitor from 'fsmonitor';
import path from 'path';
import * as _ from 'lodash';

import MetadataDBHandler from '../db/file-metadata-db';
import * as metaUtils from '../sync-engine/meta-data';
import {getFolderChecksum} from "./sync-actions";
import {environment} from "../../environments/index";
import ChecksumDBHandler from "../db/checksum-db";

export const ChangeType = {FILE: 'file', DIR: 'dir'};

/**
 * @author Pamoda Wimalasiri
 * @author Dulaj Atapattu
 */
export default class FileSystemEventListener {

  constructor(username, folder, deviceIDs) {
    FileSystemEventListener.isWatcherRunning = false;

    this.pdPath = environment.PD_FOLDER_PATH;
    this.username = username;
    this.deviceIDs = deviceIDs;
    this.folder = folder;

    this.baseDirectory = path.resolve(this.pdPath, this.folder);
    this.hashtable = {};
    this.data = {};
    this.changes = [];
    this.serializeLock = 0;
  }

  start() {
    // noinspection JSUnusedLocalSymbols
    this.monitor = fsmonitor.watch(this.baseDirectory, {
      matches: function (relPath) {
        return relPath.match(/(\/\.)|(\\\.)|^(\.)/) === null;
      },
      excludes: function (relPath) {
        return false;
      }
    });

    console.log('Watch ', this.baseDirectory);

    this.monitor.on('change', async (change) => {
      this.changes.push(change);

      if (this.serializeLock === 0) {
        this.consume(this.changes.shift());
      }
    });
  }

  stop(){
    console.log('Remove watch ', this.baseDirectory);
    this.monitor.close();
  }

  async consume(change) {
    this.serializeLock++;
    clearTimeout(FileSystemEventListener.timeOutId);
    FileSystemEventListener.isWatcherRunning = true;

    // Change watcher relative paths to absolute paths
    _.each(change, (changeList, changeListName) => {
      _.each(changeList, (relativePath, index) => {
        change[changeListName][index] = path.join(this.baseDirectory, relativePath);
      });
    });

    if (change.addedFolders.length > 0 && change.addedFolders.length === change.removedFolders.length) {
      // Rename directory
      console.log("Watcher [DIR][RENAME] ", change.removedFolders[0], ' --> ', change.addedFolders[0]);

      const newPath = _.replace(change.addedFolders[0], this.pdPath, '');
      const oldPath = _.replace(change.removedFolders[0], this.pdPath, '');

      ChecksumDBHandler.updateFilePathsAfterRename(oldPath, newPath);

      MetadataDBHandler.insertEntry({
        action: SyncEvents.RENAME,
        user: this.username,
        deviceIDs: this.deviceIDs,
        path: newPath,
        type: ChangeType.DIR,
        current_cs: await getFolderChecksum(change.addedFolders[0]),
        oldPath: oldPath,
        sequence_id: FileSystemEventListener.sequenceID++
      });

    } else if (change.addedFiles.length === 1 && change.removedFiles.length === 1) {
      // Rename file
      console.log("Watcher [FILE][RENAME] ", change.removedFiles[0], ' --> ', change.addedFiles[0]);

      const path = _.replace(change.addedFiles[0], this.pdPath, '');
      const oldPath = _.replace(change.removedFiles[0], this.pdPath, '');

      MetadataDBHandler.updateEntry(oldPath, {
        action: SyncEvents.RENAME,
        user: this.username,
        deviceIDs: this.deviceIDs,
        type: ChangeType.FILE,
        path: path,
        oldPath: oldPath,
        current_cs: metaUtils.getCheckSum(change.addedFiles[0]),
        sequence_id: FileSystemEventListener.sequenceID++
      });

    } else {
      // New directory
      for (let i = 0; i < change.addedFolders.length; i++) {
        console.log("Watcher [DIR][NEW] ", change.addedFolders[i]);

        console.log('PD_FOLDER_PATH: ', change.addedFolders[i], this.pdPath);

        MetadataDBHandler.insertEntry({
          action: SyncEvents.NEW,
          user: this.username,
          deviceIDs: this.deviceIDs,
          path: _.replace(change.addedFolders[i], this.pdPath, ''),
          type: ChangeType.DIR,
          current_cs: await getFolderChecksum(change.addedFolders[i]),
          sequence_id: FileSystemEventListener.sequenceID++
        });
      }

      // New file
      for (let i = 0; i < change.addedFiles.length; i++) {
        console.log("Watcher [FILE][NEW] ", change.addedFiles[i]);

        const newPath = _.replace(change.addedFiles[i], this.pdPath, '');

        MetadataDBHandler.updateEntry(newPath, {
          action: SyncEvents.NEW,
          user: this.username,
          deviceIDs: this.deviceIDs,
          path: newPath,
          type: ChangeType.FILE,
          current_cs: metaUtils.getCheckSum(change.addedFiles[i]),
          sequence_id: FileSystemEventListener.sequenceID++
        });
      }

      // Modify file
      for (let i = 0; i < change.modifiedFiles.length; i++) {
        console.log("Watch [FILE][MODIFY]  ", change.modifiedFiles[i]);

        const newPath = _.replace(change.modifiedFiles[i], this.pdPath, '');

        MetadataDBHandler.updateEntry(newPath, {
          action: SyncEvents.MODIFY,
          user: this.username,
          deviceIDs: this.deviceIDs,
          path: newPath,
          type: ChangeType.FILE,
          current_cs: metaUtils.getCheckSum(change.modifiedFiles[i]),
          sequence_id: FileSystemEventListener.sequenceID++
        });
      }

      // Delete files
      for (let i = change.removedFiles.length - 1; i > -1; i--) {
        console.log("Watch [FILE][DELETE] ", change.removedFiles[i]);

        const path = _.replace(change.removedFiles[i], this.pdPath, '');

        MetadataDBHandler.updateEntry(path, {
          action: SyncEvents.DELETE,
          user: this.username,
          deviceIDs: this.deviceIDs,
          path: path,
          type: ChangeType.FILE,
          sequence_id: FileSystemEventListener.sequenceID++
        });
      }

      // Delete directories
      for (let i = change.removedFolders.length - 1; i > -1; i--) {
        console.log("Watch [DIR][DELETE] ", change.removedFolders[i]);

        const path = _.replace(change.removedFolders[i], this.pdPath, '');

        MetadataDBHandler.updateEntry(path, {
          action: SyncEvents.DELETE,
          user: this.username,
          deviceIDs: this.deviceIDs,
          path: path,
          type: ChangeType.DIR,
          sequence_id: FileSystemEventListener.sequenceID++
        });
      }

    }

    if (this.changes.length > 0) {
      this.consume(this.changes.shift());
    }

    this.serializeLock--;

    FileSystemEventListener.timeOutId = setTimeout(() => {
      FileSystemEventListener.isWatcherRunning = false;
    }, 5000);
  }

  stop() {
    this.monitor.close();
    console.log('Unwatch ', this.baseDirectory);
  }
}
