const io = require('socket.io-client');
const ss = require('socket.io-stream');

import * as _ from 'lodash';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import mkdirp from 'mkdirp';

import {checkExistence} from '../sync-engine/sync-actions';

import {environment} from "../../environments/index";
import NisClientDbHandler from "../db/nis-db";
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";

/**
 * @author Anuradha Wickramarachchi
 */
export default class NisCommunicator {

  constructor(deviceId, otherDeviceId, username) {
    this.deviceId = deviceId;
    this.otherDeiviceId = otherDeviceId;
    this.username = username;
    this.ip = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd)).ip;

    this.sock = io(`http://${this.ip}:5001`);

    ss(this.sock).on('file', (readStream, json) => {
      const filePath = path.join(environment.NIS_DATA_PATH, this.deviceId, json.username, json.path);
      this.preparePath(path.dirname(filePath));
      readStream.pipe(fs.createWriteStream(filePath));
    });

    this.sock.on('callBack', (response) => {
      switch (response.type) {
        case 'getEvents':
          const ids = [];

          _.each(response.data, (eventObj) => {
            console.log('[EVENT_FROM_PD]', eventObj.path);
            eventObj.fileFetched = false;
            NisClientDbHandler.upsertEntry(eventObj);
            ids.push(eventObj._id);
          });

          this.sock.emit('message', {type: 'flushEvents', ids: ids});
          break;

        case 'flushEvents':
          if (response.data) {
            this.updateCarrier();
          }
          break;
      }
    });

  }

  requestFileHashes() {
    const sock = this.sock;

    // Get the events from the pd.
    sock.emit('message', {
      type: 'getEvents',
      username: this.username,
      otherDeviceID: this.otherDeiviceId
    });
  }

  async updateCarrier() {
    const creatorPath = path.join(environment.NIS_DATA_PATH, this.deviceId, this.username);
    const sock = this.sock;
    const eventsFromPd = (await NisClientDbHandler.getOrderedOperations(this.otherDeiviceId, this.username, false)).data;

    this.preparePath(creatorPath);

    _.each(eventsFromPd, (eventObj) => {
      switch (eventObj.action) {
        case 'MODIFY':
          sock.emit('message', {type: 'requestFile', username: eventObj.user, path: eventObj.path});
          break;

        case 'NEW':
          if (eventObj.type === 'dir') {
            // create the folder
            const folderPath = path.join(environment.NIS_DATA_PATH, this.deviceId, eventObj.user, eventObj.path);
            this.preparePath(folderPath);
          } else if (eventObj.type === 'file') {
            sock.emit('message', {type: 'requestFile', username: eventObj.user, path: eventObj.path});
          }
          break;

        case 'RENAME':
          const oldPath = path.join(environment.NIS_DATA_PATH, this.deviceId, eventObj.user, eventObj.oldPath);
          const newPath = path.join(environment.NIS_DATA_PATH, this.deviceId, eventObj.user, eventObj.path);

          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            eventObj.action = 'MODIFY';
            delete eventObj.oldPath;
            NisClientDbHandler.upsertEntry(eventObj);
          }

          break;

        case 'DELETE':
          const fullPath = path.join(environment.NIS_DATA_PATH, this.deviceId, eventObj.user, eventObj.path);

          if (fs.existsSync(fullPath)) {
            if (fs.statSync(fullPath).isDirectory()) {
              fse.removeSync(fullPath);
            } else {
              fs.unlinkSync(fullPath);
            }
          }

          break;
      }

      eventObj.fileFetched = true;
      NisClientDbHandler.upsertEntry(eventObj);
    });

    /*const conflicts = [];

    // Comapre both type of events and detect conflicts
    _.each(eventsFromPd, (event1) => {
      _.each(eventsFromCarrier, (event2) => {
        // if the event corresponds to the same path and username
        if (event1.path === event2.path) {
          conflicts.push({
            pdEvent: event1,
            carrierEvent: event2
          })
        }
      });
    });

    // First work on conflciting events
    _each(conflicts, (conflict) => {
      // Remove conflicting events from pd events list and carrier events list.
      eventsFromPd.splice(conflict.pdEvent, 1);
      eventsFromCarrier.splice(conflict.carrierEvent, 1);

      // Then resolve the conflicts
      sock.emit('message', {
        type: 'rename',
        ignore: true,
        username: conflict.user,
        path: otherEvent.path,
        oldPath: otherEvent.oldPath
      });
    });*/

    // Get the events from the carrier
    const eventsFromCarrier = (await NisClientDbHandler.getOrderedOperations(this.deviceId, this.username, true)).data;
    const foldersToDelete = [];

    _.each(eventsFromCarrier, (event) => {
      console.log('[EVENT_FROM_CARRIER]', event.path);
      switch (event.action) {
        case 'NEW':
          const newFilePath = path.join(environment.NIS_DATA_PATH, this.otherDeiviceId, this.username, event.path);

          if (fs.existsSync(newFilePath)) {
            if (!fs.statSync(newFilePath).isDirectory()) {
              const writeStream = ss.createStream();
              ss(sock).emit('file', writeStream, {
                type: 'new',
                ignore: true,
                fileType: event.type, // dir or file
                path: event.path,
                username: this.username
              });
              fs.createReadStream(newFilePath).pipe(writeStream);

              writeStream.on('finish', () => {
                if (fs.existsSync(newFilePath)) {
                  fs.unlinkSync(newFilePath);
                }
              });

            } else {
              foldersToDelete.push(newFilePath);
            }
          }

          NisClientDbHandler.removeEvent(event._id);

          break;

        case 'MODIFY':
          const modFilePath = path.join(environment.NIS_DATA_PATH, this.otherDeiviceId, this.username, event.path);

          if (fs.existsSync(modFilePath)) {
            const writeStream = ss.createStream();
            ss(sock).emit('file', writeStream, {
              type: 'update',
              ignore: true,
              path: event.path,
              username: this.username
            });
            fs.createReadStream(modFilePath).pipe(writeStream);

            writeStream.on('finish', () => {
              if (fs.existsSync(modFilePath)) {
                fs.unlinkSync(modFilePath);
              }
            });
          }

          NisClientDbHandler.removeEvent(event._id);
          break;

        case 'DELETE':
          sock.emit('message', {
            type: 'delete',
            ignore: true,
            username: event.user,
            path: event.path
          });

          NisClientDbHandler.removeEvent(event._id);
          break;

        case 'RENAME':
          sock.emit('message', {
            type: 'rename',
            ignore: true,
            username: event.user,
            path: event.path,
            oldPath: event.oldPath
          });

          NisClientDbHandler.removeEvent(event._id);
          break;

      }
    });

    _.each(foldersToDelete, (folderPath) => {
      if (checkExistence(folderPath)) {
        fse.removeSync(folderPath);
      }
    });

  }

  preparePath(filepath) {
    if (!fs.existsSync(filepath)) {
      mkdirp.sync(filepath);
    }
  }
}
