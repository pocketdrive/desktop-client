import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

import {NisFolder} from "../models/nis-folder";
import {NisService} from "../providers/nis.service";

@Component({
  selector: 'app-sync-pp',
  templateUrl: './sync-pp.component.html',
  styleUrls: ['./sync-pp.component.scss']
})
export class SyncPdPdComponent implements OnInit {

  selectedFolder: NisFolder;
  deviceList: any[];

  constructor(private nisService: NisService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.nisService.getNisFolderList();
  }

  get folders(): NisFolder[]{
    return this.nisService.folders;
  }

  set folders(folders: NisFolder[]) {
    this.nisService.folders = folders;
  }

  okModal(): void {
    let syncDevices = [];

    for (let i = 0; i < this.deviceList.length; i++) {
      if (this.deviceList[i].sync) {
        syncDevices.push(this.deviceList[i].uuid);
      }
    }

    this.selectedFolder.syncDevices = syncDevices;
  }

  openDeviceSelectionDialog(folder: NisFolder): void {
    this.selectedFolder = folder;
    this.deviceList = [];

    for (let i = 0; i < this.nisService.remotePds.length; i++) {
      let item = JSON.parse(JSON.stringify(this.nisService.remotePds[i]));

      if (this.selectedFolder.syncDevices) {
        for (let j = 0; j < this.selectedFolder.syncDevices.length; j++) {
          if (this.nisService.remotePds[i].uuid === this.selectedFolder.syncDevices[j]) {
            item.sync = true;
            break;
          }
          else {
            item.sync = false;
          }
        }
      }

      this.deviceList.push(item);
    }
  }

  ok(): void {
    this.nisService.setNisFolderList(this.folders);
  }

  cancel(): void {
    this.router.navigate(['explorer'], {relativeTo: this.activatedRoute.parent});
  }

}
