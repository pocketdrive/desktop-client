import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { PocketDrive } from "../models/pocketdrive";

@Injectable()
export class PocketDriveService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private url = 'api/discover-pd';

  constructor(private http: Http) { }

  discoverPds(): Promise<PocketDrive[]> {
    return this.http.get(this.url)  
               .toPromise()
               .then(response => response.json() as PocketDrive[])
               .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  /*private listenForPDs(){
    var _ = require('lodash');
    var Client = require('node-ssdp').Client, client = new Client();
    var responses = {};
    
    client.search('urn:schemas-upnp-org:device:PocketDrive');
    client.on('response', function inResponse(headers, code, rinfo) {
      var uuid =  _.split(headers.USN, ':', 2)[1];

      if(!responses[uuid]){
        var location = _.split(headers.LOCATION, '/', 4);
        var host = _.split(location[2], ':', 2);
        var name = _.reduce(_.split(location[3], '-'), (word1, word2) => {
          return _.capitalize(word1) + ' ' + _.capitalize(word2);
        });

        var response = {
          uuid:uuid,
          name: name,
          ip: host[0],
          port: host[1]
        };

        responses[uuid] = response;
      }
    });

    setTimeout(function() {
      client.stop();
      // _.each(responses, (response) => console.log(response));
    }, 1000);
  }*/

}