import {Socket} from 'fast-tcp';
import * as _ from 'lodash';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';

import {checkExistence, isFolderEmpty} from '../sync-engine/sync-actions';

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

    this.sock = new Socket({
      host: this.ip,
      port: 5001
    });
  }

  reconnect() {
    this.sock.destroy();

    this.sock = new Socket({
      host: this.ip,
      port: 5001
    });
  }

  requestFileHashes() {
    const sock = this.sock;

    sock.on('file', (readStream, json) => {
      const filepath = path.join(environment.NIS_DATA_PATH, this.deviceId, json.username, json.path);
      this.preparePath(path.dirname(filepath));
      const writeStream = fs.createWriteStream(filepath);

      readStream.pipe(writeStream);
    });

    sock.emit('message', {type: 'getEvents'}, async (response) => {
      console.log('getEvents', response);
      const ids = [];

      _.each(response.data, (eventObj) => {
        console.log('getEvents: ', JSON.stringify(eventObj));
        NisClientDbHandler.insertEntry(eventObj);
        ids.push(eventObj._id);
      });

      sock.emit('message', {type: 'flushEvents', ids: ids}, (response) => {
        console.log('flushEvents');
        if (response) {
          this.updateCarrier();
        }
      });
    });
  }

  async updateCarrier() {
    // create paths if not exist
    const creatorPath = path.join(environment.NIS_DATA_PATH, this.deviceId, this.username);
    const sock = this.sock;
    const events = (await NisClientDbHandler.getOrderedOperations(this.otherDeiviceId, this.username)).data;

    this.preparePath(creatorPath);

    _.each(events, (eventObj) => {
      switch (eventObj.action) {
        case 'MODIFY':
          sock.emit('message', {type: 'requestFile', username: eventObj.user, path: eventObj.path});
          // NisClientDbHandler.removeEvent(eventObj._id);
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
        // case 'DELETE':
        //   const deletePath = path.join(environment.NIS_DATA_PATH, this.deviceId, eventObj.user, eventObj.path);
        //
        //   if (fs.existsSync(deletePath)) {
        //     if (fs.statSync(deletePath).isDirectory()) {
        //       fse.removeSync(deletePath);
        //     } else {
        //       fs.unlinkSync(deletePath);
        //     }
        //   }
        //   // NisClientDbHandler.removeEvent(eventObj._id);
        //   break;
        // case 'RENAME':
        //   const oldPath = path.join(environment.NIS_DATA_PATH, this.deviceId, eventObj.user, eventObj.oldPath);
        //   const newPath = path.join(environment.NIS_DATA_PATH, this.deviceId, eventObj.user, eventObj.path);
        //
        //   // fs.renameSync(oldPath, newPath);
        //   break;
      }
    });

    // update the PD with data from carrier
    const otherEvents = (await NisClientDbHandler.getOrderedOperations(this.deviceId, this.username)).data;
    const conflicts = [];

    // Detect conflicts
    // _.each(events, (event1) => {
    //   _.each(otherEvents, (event2) => {
    //     // if the event corresponds to the same path and username
    //     if (event1.user === event2.user && event1.path === event2.path) {
    //       conflicts.push({
    //         e1: event1,
    //         e2: event2
    //       })
    //     }
    //   });
    // });

    // For all other non-conflicting items
    _.each(otherEvents, (otherEvent) => {
      // const hasConflict = _.find(conflicts, (obj) => {
      //   return obj.e2 === otherEvent;
      // });

      if (true) {
        switch (otherEvent.action) {
          case 'NEW':
            const newFilePath = path.join(environment.NIS_DATA_PATH, this.otherDeiviceId, this.username, otherEvent.path);
            const newType = otherEvent.type; // dir or file

            if (fs.existsSync(newFilePath)) {
              const writeStream = sock.stream('file', {
                type: 'new',
                fileType: newType,
                path: otherEvent.path,
                username: this.username
              });

              if (!fs.statSync(newFilePath).isDirectory()) {
                fs.createReadStream(newFilePath).pipe(writeStream);
                writeStream.on('finish', () => {
                  fs.unlinkSync(newFilePath);
                  writeStream.end();
                });
              } else {
                if (checkExistence(newFilePath) && isFolderEmpty(newFilePath)) {
                  fs.rmdirSync(newFilePath);
                }
              }

              // TODO if the folder is empty, delete it
            }
            break;
          case 'MODIFY':
            const modFilePath = path.join(environment.NIS_DATA_PATH, this.otherDeiviceId, this.username, otherEvent.path);

            if (fs.existsSync(modFilePath)) {
              const writeStream = sock.stream('file', {
                type: 'update',
                path: otherEvent.path,
                username: this.username
              });
              fs.createReadStream(modFilePath).pipe(writeStream);
              writeStream.on('finish', () => {
                if (fs.statSync(modFilePath).isDirectory()) {
                  fs.rmdirSync(modFilePath);
                } else {
                  fs.unlinkSync(modFilePath);
                }
              });
              // writeStream.end(); // TODO to be tested
            }
            break;
          case 'DELETE':
            // TODO is the type really needed?
            // const deleteType = otherEvent.type;
            sock.emit('message', {
              type: 'delete',
              // deleteType: deleteType,
              username: otherEvent.user,
              path: otherEvent.path
            });
            break;
          case 'RENAME':
            const renameType = otherEvent.type;

            sock.emit('message', {
              type: 'rename',
              username: otherEvent.user,
              renameType: renameType,
              path: otherEvent.path,
              oldPath: otherEvent.oldPath
            });
            break;
        }
      }
    });

    // Now its ok to clean the other events since all are cleaned


    // const that = this;
    // setTimeout(() => {
    //     // that.reconnect();
    //     that.requestFileHashes();
    // }, 5000);
  }

  preparePath(filepath) {
    if (!fs.existsSync(filepath)) {
      mkdirp.sync(filepath);
    }
  }
}
