import {Injectable} from '@angular/core';
import {Folder} from "../models/folder";
import {HttpInterceptor} from "./http-interceptor.service";

@Injectable()
export class SyncService {

  private url = 'sync/list';

  constructor(private http: HttpInterceptor) {
  }

  getSyncFolderList(): Promise<Folder[]> {
    let message = {type: 'getSyncFolders'};

    return this.http
      .post(this.url, JSON.stringify(message))
      .toPromise()
      .then((response) => response.json() as Folder[])
      .catch(SyncService.handleError);

    // this.syncFolders = data.json();
    // return this.syncFolders;
  }

  static handleError(error: any): Promise<any> {
    console.log('handler error');
    return Promise.reject(error.message || error);
  }

}
