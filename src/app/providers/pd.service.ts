import {Injectable} from '@angular/core';

import 'rxjs/add/operator/toPromise';

const _ = require('lodash');
const Ssdp = require('node-ssdp-lite');

import {PocketDrive} from "../models/pocketdrive";
import {Router} from "@angular/router";

/*const PDS = {
 local: [
 {uuid: '0001', name: 'Ground Floor', ip: '192.168.8.2', port: 3000},
 {uuid: '0003', name: 'Top Floor', ip: '192.168.8.5', port: 3000}
 ],
 remote: [
 {uuid: '0001', name: 'Home Device', ip: '192.168.8.2', port: 3000}
 ]
 };*/

@Injectable()
export class PocketDriveService {

  localPDs: PocketDrive[] = [];
  remotePDs: PocketDrive[] = [];

  constructor(private router: Router) {
  }

  getPD(type: string, uuid: string): PocketDrive {
    if (type == 'local') {
      return this.localPDs.find(pd => pd.uuid === uuid);
    }

    if (type == 'remote') {
      return this.remotePDs.find(pd => pd.uuid === uuid);
    }
  }

  listenForPDs(): void {
    let client = new Ssdp();
    let self = this;
    this.localPDs = [];

    client.on('response', (msg) => {
      let headers = _.split(msg, '\n');
      let uuid = _.split(headers[2], ':')[5];

      if (uuid && !self.localPDs.find(pd => pd.uuid === uuid)) {
        let host = _.split(_.split(headers[3], '/')[2], ':');
        let name = _.reduce(_.split(_.split(headers[3], '/')[3], '-'), (word1, word2) => {
          return _.capitalize(word1) + ' ' + _.capitalize(word2);
        });

        let pd = {
          uuid: uuid,
          name: _.trim(name, '\r'),
          ip: host[0],
          port: host[1]
        };

        self.localPDs.push(pd);
      }
    });

    // client.search('urn:schemas-upnp-org:device:PocketDrive');
    client.search('ssdp:all');

    setTimeout(() => {
      client.stop();
      this.router.navigate(['selectpd']);
    }, 3000);
  }

}
