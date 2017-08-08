import {Component, OnInit} from '@angular/core';

import {Folder} from '../models/folder';

import * as _ from 'lodash'
import {SyncService} from "../providers/sync.service";
import {HttpInterceptor} from "../providers/http-interceptor.service";

@Component({
  selector: 'app-sync-cp',
  templateUrl: './sync-cp.component.html',
  styleUrls: ['./sync-cp.component.scss']
})

export class SyncClientPdComponent implements OnInit {

  folders: Folder[];
  allSelected: boolean;

  constructor(private syncService: SyncService,
              private http: HttpInterceptor) {
    this.allSelected = false;
  }

  ngOnInit() {
    this.syncService.getSyncFolderList().then((result) => {
      this.folders = result;
    })
  }

  // Called when select all checkbox is clicked.
  selectAll(): void {
    _.each(this.folders, (folder) => {
      folder.sync = !this.allSelected;
    })
  }

}
