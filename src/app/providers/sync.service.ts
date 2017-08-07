import {Injectable} from '@angular/core';
import {BASE_URL} from "../const";
import {Folder} from "../models/folder";
import {getSyncFolders, MessageHandler} from "./messages";
import {HttpInterceptor} from "./http-interceptor.service";

@Injectable()
export class SyncService {

  private url = BASE_URL + 'signin';

  syncFolders: Folder[];

  constructor(private http: HttpInterceptor) {
  }

  async getSyncFolderList(): Promise<Folder[]> {
    let message = MessageHandler.getMessage(getSyncFolders);

    let data = await this.http
      .post(this.url, JSON.stringify(message), MessageHandler.getJsonHeaders())
      .toPromise();

    this.syncFolders = data.json().data;
    return this.syncFolders;
  }

}
