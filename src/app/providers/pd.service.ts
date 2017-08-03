import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

// import * as _ from 'lodash'
// import { Client } from 'node-ssdp';

import { PocketDrive } from "../models/pocketdrive";

const PDS = {
  local : [
    { uuid: '0001', name: 'Ground Floor', ip: '192.168.8.2', port:3000 },
    { uuid: '0003', name: 'Top Floor', ip: '192.168.8.5', port:3000 }
  ],
  remote : [
    { uuid: '0001', name: 'Home Device', ip: '192.168.8.2', port:3000 }
  ]
}

@Injectable()
export class PocketDriveService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private url = 'api/discover-pd';

  localPDs: PocketDrive[];
  remotePDs: PocketDrive[];

  constructor(private http: Http) {
    this.localPDs = PDS.local;
    this.remotePDs = PDS.remote;
  }

  getPD(type: string, uuid: string): PocketDrive {
    if(type == 'local'){
      return this.localPDs.find(pd => pd.uuid === uuid);
    }

    if(type == 'remote'){
      return this.remotePDs.find(pd => pd.uuid === uuid);
    }
  }

  // listenForPDs(){
  //   var Client = require('node-ssdp').Client, client = new Client();
  //   var responses = {};
    
  //   client.search('urn:schemas-upnp-org:device:PocketDrive');
    // client.on('response', function inResponse(headers, code, rinfo) {
    //   var uuid =  _.split(headers.USN, ':', 2)[1];

    //   if(!responses[uuid]){
    //     var location = _.split(headers.LOCATION, '/', 4);
    //     var host = _.split(location[2], ':', 2);
    //     var name = _.reduce(_.split(location[3], '-'), (word1, word2) => {
    //       return _.capitalize(_.toString(word1)) + ' ' + _.capitalize(_.toString(word2));
    //     });

    //     var response = {
    //       uuid:uuid,
    //       name: name,
    //       ip: host[0],
    //       port: host[1]
    //     };

    //     responses[uuid] = response;
    //   }
    // });

    // setTimeout(function() {
    //   client.stop();
    //   _.each(responses, (response) => console.log(response));
    // }, 1000);
  // }

}