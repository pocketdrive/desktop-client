import {Injectable} from '@angular/core';
import {Folder} from "../models/folder";
import {HttpInterceptor} from "./http-interceptor.service";
import {Router} from "@angular/router";

const _ = require('lodash');

@Injectable()
export class SyncService {

  private url = 'sync/';

  constructor(private http: HttpInterceptor,
              private router: Router) {
  }

  getSyncFolderList(): Promise<Folder[]> {
    let message = {type: 'getSyncFolders'};

    return this.http
      .post(this.url + 'list', JSON.stringify(message))
      .toPromise()
      .then((response) => response.json() as Folder[])
      .catch(this.handleError);
  }

  setSyncFolderList(foldersList: Folder[]): void {
    let message = {type: 'setSyncFolders'};
    let syncFolders = [];

    for (let i = 0; i < foldersList.length; i++) {
      let folder = foldersList[i];

      if (folder.sync) {
        syncFolders.push(folder.name);
      }
    }

    message['data'] = {
      'syncFolders': syncFolders
    };

    this.http
      .post(this.url + 'set', JSON.stringify(message))
      .toPromise()
      .then((response) => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): void {
    // console.error('An error occurred', error);
    // return Promise.reject(error.message || error);
  }

}
