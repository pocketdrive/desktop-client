const io = require('socket.io-client');
const ss = require('socket.io-stream');

import path from 'path';
import fs from 'fs';
import streamToBuffer from 'stream-to-buffer';
import stream from 'stream';
import * as _ from 'lodash';

import {SyncActionMessages, SyncActions, SyncEvents, SyncMessages} from '../sync-engine/sync-constants';
import * as syncActions from '../sync-engine/sync-actions';
import {
  afterSyncFile,
  checkExistence,
  createOrModifyFile,
  deleteMetadataEntry,
  getFileChecksum,
  getFolderChecksum,
  getSyncedChecksum,
  isFolderEmpty,
  modifyExistingFile,
  setSyncedChecksum
} from '../sync-engine/sync-actions';
import {ChunkBasedSynchronizer} from "../sync-engine/chunk-based-synchronizer";
import {getCheckSum} from "../sync-engine/meta-data";
import {CommonUtils} from "../sync-engine/common";
import {environment} from "../../environments/index";

/**
 * @author Dulaj Atapattu
 */
export class SyncCommunicator {

  constructor(username, clientIP) {
    this.serializeLock = 0;
    this.serverSyncCalled = false;
    this.username = username;
    this.ip = clientIP;

    this.openSocket();
  }

  openSocket() {
    console.log('Opening sync socket');
    this.socket = io(`http://${this.ip}:5000`);
    this.initCommunication(this.socket);
  }

  closeSocket() {
    console.log('Closing sync socket');
    this.socket.disconnect();
  }

  initCommunication(socket) {
    socket.on('message', async (json) => {
      const fullPath = path.resolve(environment.PD_FOLDER_PATH, json.path);

      switch (json.type) {
        case SyncMessages.modifyFile:
          console.log('Sync message [FILE][MODIFY]: ', json.path);
          this.callBack(socket, await createOrModifyFile(fullPath, json));
          break;

        case SyncMessages.renameFile:
          console.log('Sync message [FILE][RENAME]: ', json.oldPath, ' --> ', json.path);

          let fullOldPath = path.resolve(environment.PD_FOLDER_PATH, json.oldPath);

          if (syncActions.checkExistence(fullOldPath) && !syncActions.checkExistence(fullPath)) {
            const currentChecksum = getFileChecksum(fullOldPath);

            if (currentChecksum === json.current_cs) {
              fs.renameSync(fullOldPath, fullPath);
              this.callBack(socket, {type: 'onResponse', action: SyncActions.doNothingFile, dbEntry: json.dbEntry});

            } else if (currentChecksum === json.synced_cs) {
              fs.renameSync(fullOldPath, fullPath);
              this.callBack(socket, await createOrModifyFile(fullPath, json));

            } else {
              this.callBack(socket, await createOrModifyFile(fullPath, json));
            }
          }
          if (syncActions.checkExistence(fullOldPath) && syncActions.checkExistence(fullPath)) {
            const currentChecksumOld = getFileChecksum(fullOldPath);
            const currentChecksumNew = getFileChecksum(fullPath);

            if (currentChecksumOld === currentChecksumNew) {
              fs.unlinkSync(fullOldPath);
            }
          }
          else {
            this.callBack(socket, await createOrModifyFile(fullPath, json));
          }

          break;

        case SyncMessages.deleteFile:
          console.log('Sync message [FILE][DELETE]: ', json.path);

          if (syncActions.checkExistence(fullPath)) {
            const currentChecksum = getFileChecksum(fullPath);

            if (json.synced_cs === currentChecksum) {
              fs.unlinkSync(fullPath);
            }
          }

          this.callBack(socket, {type: 'onResponse', action: SyncActions.doNothingFile, dbEntry: json.dbEntry});

          break;

        case SyncMessages.newFolder:
          console.log('Sync message [DIR][NEW]: ', json.path);

          if (!checkExistence(fullPath)) {
            fs.mkdirSync(fullPath);
          }

          this.callBack(socket, {type: 'onResponse', action: SyncActions.doNothingDir, dbEntry: json.dbEntry});

          break;

        case SyncMessages.deleteFolder:
          console.log('Sync message [DIR][DELETE]: ', json.path);

          if (syncActions.checkExistence(fullPath) && isFolderEmpty(fullPath)) {
            fs.rmdirSync(fullPath);
          }

          this.callBack(socket, {type: 'onResponse', action: SyncActions.doNothingDir, dbEntry: json.dbEntry});

          break;

        case SyncMessages.renameFolder:
          console.log('Sync message [DIR][RENAME]: ', json.oldPath, ' --> ', json.path);

          fullOldPath = path.resolve(environment.PD_FOLDER_PATH, json.oldPath);

          if (checkExistence(fullOldPath) && await getFolderChecksum(fullOldPath) === json.current_cs) {
            if (!checkExistence(fullPath)) {
              fs.renameSync(fullOldPath, fullPath);
            }
            else if (await getFolderChecksum(fullOldPath) === await getFolderChecksum(fullPath)) {
              fs.rmdirSync(fullOldPath);
            }
            else {
              const names = _.split(json.path, '/');
              const newName = names[names.length - 1] + '(conflicted-copy-of-' + json.username + '-' + CommonUtils.getDeviceName() + '-' + CommonUtils.getDateTime() + ')';
              const newPath = _.replace(json.path, names[names.length - 1], newName);
              const fullNewPath = path.resolve(environment.PD_FOLDER_PATH, newPath);

              fs.renameSync(fullOldPath, fullNewPath);
            }

            this.callBack(socket, {type: 'onResponse', action: SyncActions.doNothingDir, dbEntry: json.dbEntry});

          }
          else {
            if (!checkExistence(fullPath)) {
              this.callBack(socket, {type: 'onResponse', action: SyncActions.streamFolder, isConflict: false, dbEntry: json.dbEntry});
            }
            else if (await getFolderChecksum(fullPath) === json.current_cs) {
              this.callBack(socket, {type: 'onResponse', action: SyncActions.doNothingDir, dbEntry: json.dbEntry});
            }
            else {
              this.callBack(socket, {type: 'onResponse', action: SyncActions.streamFolder, isConflict: true, dbEntry: json.dbEntry});
            }
          }

          break;
      }
    });

    socket.on('action', async (json) => {
      const fullPath = path.resolve(environment.PD_FOLDER_PATH, json.path);

      switch (json.type) {
        case SyncActionMessages.newFolder:
          console.log('Sync action [NEW_FOLDER]: ', json.path);
          fs.mkdirSync(fullPath);
          this.callBack(socket, {type: 'newFolder', username: json.username, sourcePath: json.sourcePath});
          break;
      }
    });

    ss(socket).on('file', function (readStream, json) {
      console.log('Sync file [FILE_COPY]: ', json.path);

      const fullPath = path.resolve(environment.PD_FOLDER_PATH, json.path);

      let writeStream = fs.createWriteStream(fullPath);
      readStream.pipe(writeStream);

      writeStream.on('finish', function () {
        setSyncedChecksum(json.path, getCheckSum(fullPath));
      });
    });

    ss(socket).on('transmissionData', (readStream, json) => {
      console.log('Sync transmissionData: ', json.path);

      streamToBuffer(readStream, (err, transmissionData) => {
        const fullPath = path.resolve(environment.PD_FOLDER_PATH, json.path);
        ChunkBasedSynchronizer.updateOldFile(transmissionData, fullPath);
      })
    });

    socket.on('callBack', async (json) => {
      switch (json.type) {
        case 'onResponse':
          this.onResponse(json);
          break;

        case 'newFolder':
          const fullSourcePath = path.resolve(environment.PD_FOLDER_PATH, json.sourcePath);
          const files = fs.readdirSync(fullSourcePath);

          for (let i = 0; i < files.length; i++) {
            const sourceItemPath = path.join(json.sourcePath, files[i]);
            const targetItemPath = path.join(targetPath, files[i]);
            const fullSourceItemPath = path.resolve(environment.PD_FOLDER_PATH, sourceItemPath);

            if (fs.statSync(fullSourceItemPath).isDirectory()) {
              await this.syncNewDirectory(sourceItemPath, targetItemPath);
            }
            else {
              const writeStream = ss.createStream();
              ss(this.socket).emit('file', writeStream, {username: this.username, path: targetItemPath});
              fs.createReadStream(fullSourceItemPath).pipe(writeStream);
            }
          }
          break;

        case 'serverToPdSync':
          this.serializeLock--;
          break;
      }
    });
  }

  async sendSyncRequest(dbEntry) {
    this.serializeLock++;

    if (dbEntry.type === 'file') {
      switch (dbEntry.action) {
        case SyncEvents.NEW:
        case SyncEvents.MODIFY:
          console.log('Sync request [FILE][MODIFY]: ', dbEntry.path);

          this.socket.emit('message', {
            username: this.username,
            type: SyncMessages.modifyFile,
            path: dbEntry.path,
            current_cs: dbEntry.current_cs,
            synced_cs: await getSyncedChecksum(dbEntry.path),
            dbEntry: dbEntry
          });

          break;

        case SyncEvents.RENAME:
          console.log('Sync request [FILE][RENAME]: ', dbEntry.oldPath, ' --> ', dbEntry.path);

          this.socket.emit('message', {
            username: this.username,
            type: SyncMessages.renameFile,
            path: dbEntry.path,
            oldPath: dbEntry.oldPath,
            current_cs: dbEntry.current_cs,
            synced_cs: await getSyncedChecksum(dbEntry.path),
            dbEntry: dbEntry
          });

          break;

        case SyncEvents.DELETE:
          console.log('Sync request [FILE][DELETE]: ', dbEntry.path);

          this.socket.emit('message', {
            username: this.username,
            type: SyncMessages.deleteFile,
            path: dbEntry.path,
            current_cs: dbEntry.current_cs,
            synced_cs: await getSyncedChecksum(dbEntry.path),
            dbEntry: dbEntry
          });
          break;
      }
    } else if (dbEntry.type === 'dir') {
      switch (dbEntry.action) {
        case SyncEvents.NEW:
          console.log('Sync request [DIR][NEW]: ', dbEntry.path);

          this.socket.emit('message', {
            username: this.username,
            type: SyncMessages.newFolder,
            path: dbEntry.path,
            dbEntry: dbEntry
          });

          break;

        case SyncEvents.RENAME:
          console.log('Sync request [DIR][RENAME]: ', dbEntry.oldPath, ' --> ', dbEntry.path);

          this.socket.emit('message', {
            username: this.username,
            type: SyncMessages.renameFolder,
            path: dbEntry.path,
            oldPath: dbEntry.oldPath,
            current_cs: dbEntry.current_cs,
            dbEntry: dbEntry
          });

          break;

        case SyncEvents.DELETE:
          console.log('Sync request [DIR][DELETE]: ', dbEntry.path);

          this.socket.emit('message', {
            username: this.username,
            type: SyncMessages.deleteFolder,
            path: dbEntry.path,
            dbEntry: dbEntry
          });

          break;
      }
    }
  }

  async onResponse(response) {
    const dbEntry = response.dbEntry;
    const fullPath = path.resolve(environment.PD_FOLDER_PATH, dbEntry.path);
    const writeStream = ss.createStream();

    switch (response.action) {
      case SyncActions.justCopy:
        console.log('Sync response [FILE][JUST_COPY]: ', dbEntry.path);

        if (checkExistence(fullPath)) {
          ss(this.socket).emit('file', writeStream, {username: this.username, path: dbEntry.path});
          fs.createReadStream(fullPath).pipe(writeStream);
        }

        afterSyncFile(dbEntry.sequence_id, dbEntry.path, dbEntry.current_cs);
        break;

      case SyncActions.doNothingFile:
        console.log('Sync response [FILE][DO_NOTHING_FILE]: ', dbEntry.path);

        afterSyncFile(dbEntry.sequence_id, dbEntry.path, dbEntry.current_cs);
        break;

      case SyncActions.doNothingDir:
        console.log('Sync response [DIR][DO_NOTHING_DIR]: ', dbEntry.path);

        afterSyncFile(dbEntry.sequence_id, dbEntry.path, dbEntry.current_cs);
        break;

      case SyncActions.update:
        console.log('Sync response [FILE][UPDATE]: ', dbEntry.path);

        const newFileChecksum = await ChunkBasedSynchronizer.getChecksumOfChunks(fullPath);
        const transmissionData = await ChunkBasedSynchronizer.getTransmissionData(response.oldFileChecksums, newFileChecksum, fs.readFileSync(fullPath));

        ss(this.socket).emit('transmissionData', writeStream, {username: this.username, path: dbEntry.path});
        let bufferStream = new stream.PassThrough();
        bufferStream.end(transmissionData);
        bufferStream.pipe(writeStream);

        afterSyncFile(dbEntry.sequence_id, dbEntry.path, dbEntry.current_cs);
        break;

      case SyncActions.conflict:
        console.log('Sync response [FILE][CONFLICT]: ', dbEntry.path);

        const names = _.split(dbEntry.path, '/');
        const nameAndExtension = _.split(names[names.length - 1], '.');
        const newNameWithExtension = nameAndExtension[0] + '(conflicted-copy-of-' + this.username + '-' + CommonUtils.getDeviceName() + '-' + CommonUtils.getDateTime() + ').' + nameAndExtension[1];
        const newPath = _.replace(dbEntry.path, names[names.length - 1], newNameWithExtension);
        const fullNewPath = path.resolve(environment.PD_FOLDER_PATH, newPath);

        fs.renameSync(fullPath, fullNewPath);

        ss(this.socket).emit('file', writeStream, {username: this.username, path: newPath});
        fs.createReadStream(fullNewPath).pipe(writeStream);

        writeStream.on('finish', () => {
          console.log('Conflicted file copied : ' + fullNewPath);
          deleteMetadataEntry(dbEntry.sequence_id);
          setSyncedChecksum(newPath, dbEntry.current_cs);
        });

        break;

      case SyncActions.streamFolder:
        console.log('Sync response [DIR][STREAM_FOLDER]: ', dbEntry.path);

        if (response.isConflict) {
          const names = _.split(dbEntry.path, '/');
          const newName = names[names.length - 1] + '(conflicted-copy-of-' + this.username + '-' + CommonUtils.getDeviceName() + '-' + CommonUtils.getDateTime() + ')';
          const newPath = _.replace(dbEntry.path, names[names.length - 1], newName);

          this.syncNewDirectory(dbEntry.path, newPath);

        } else {
          this.syncNewDirectory(dbEntry.path, dbEntry.path)
        }

        afterSyncFile(dbEntry.sequence_id, dbEntry.path, dbEntry.current_cs);
        break;
    }

    this.serializeLock--;
  }

  async syncNewDirectory(targetPath) {
    this.serializeLock++;
    // TODO: Recheck for folder names with dots.

    this.socket.emit('action', {
      username: this.username,
      type: SyncActionMessages.newFolder,
      path: targetPath,
      sourcePath: sourcePath
    });

    this.serializeLock--;
  }

  requestServerToClientSync() {
    this.serverSyncCalled = true;
    this.serializeLock++;

    this.socket.emit('action', {
      type: SyncActionMessages.serverToPdSync,
      username: this.username
    });
  }

  callBack(socket, data) {
    socket.emit('callBack', data);
  }

}
