import {Component, OnInit} from '@angular/core';

import {Folder} from '../models/folder';

import * as _ from 'lodash'
import {SyncService} from "../providers/sync.service";

const FOLDERS = [
  {name: 'DVios', size: '3.2 GB', sync: true},
  {name: 'Backup data', size: '212 MB', sync: false},
  {name: 'Documents', size: '1.1 GB', sync: true},
  {name: 'CP', size: '2.1 GB', sync: false},
  {name: 'Shared', size: '47 MB', sync: true},
]

@Component({
  selector: 'app-sync-cp',
  templateUrl: './sync-cp.component.html',
  styleUrls: ['./sync-cp.component.scss']
})

export class SyncClientPdComponent implements OnInit {

  folders: Folder[];
  allSelected: boolean;

  constructor(private syncService: SyncService) {
    this.folders = FOLDERS;
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
