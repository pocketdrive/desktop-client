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

  folders: NisFolder[];
  selectedFolder: NisFolder;
  deviceList: any[];

  constructor(private nisService: NisService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.nisService.getNisFolderList().then((result) => {
      this.folders = result;
    })
  }

  cancel(): void {
    this.router.navigate(['explorer'], {relativeTo: this.activatedRoute.parent});
  }

  ok(): void {

  }

  openDeviceSelectionDialog(folder: NisFolder): void {
    this.selectedFolder = folder;
    console.log(this.selectedFolder);
    this.deviceList = [];

    for (let i = 0; i < this.nisService.remotePds.length; i++) {
      let item = JSON.parse(JSON.stringify(this.nisService.remotePds[i]));

      if (this.selectedFolder.syncDevices) {
        for (let j = 0; j < this.selectedFolder.syncDevices.length; j++) {
          if (this.nisService.remotePds[i].uuid === this.selectedFolder.syncDevices[j].uuid) {
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

}
