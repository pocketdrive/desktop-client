import {Component, OnInit} from '@angular/core';

import {Folder} from '../models/folder';

import * as _ from 'lodash'
import {SyncService} from "../providers/sync.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-sync-cp',
  templateUrl: './sync-cp.component.html',
  styleUrls: ['./sync-cp.component.scss']
})

export class SyncClientPdComponent implements OnInit {

  allSelected: boolean;

  constructor(private syncService: SyncService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.allSelected = false;
  }

  ngOnInit() {
    this.syncService.getSyncFolderList().then((result) => {
      this.folders = result;
    })
  }

  get folders(): Folder[] {
    return this.syncService.folders;
  }

  set folders(folders: Folder[]) {
    this.syncService.folders = folders;
  }

  // Called when select all checkbox is clicked.
  selectAll(): void {
    _.each(this.folders, (folder) => {
      folder.sync = !this.allSelected;
    })
  }

  // Called when any check box except select all is clicked.
  checkBoxClicked(): void {
    this.allSelected = false;
  }

  cancel(): void {
    this.router.navigate(['explorer'], {relativeTo: this.activatedRoute.parent});
  }

  ok(): void {
    this.syncService.setSyncFolderList(this.folders);
  }

}
