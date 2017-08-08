import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';

import {PocketDrive} from "../models/pocketdrive";
import {PocketDriveService} from "../providers/pd.service";

@Component({
  selector: 'app-selectpd',
  templateUrl: './selectpd.component.html',
  styleUrls: ['./selectpd.component.scss']
})

export class SelectpdComponent implements OnInit {

  constructor(private location: Location,
              private pocketDriveService: PocketDriveService) {
  }

  ngOnInit() {
  }

  get localPds(): PocketDrive[] {
    return this.pocketDriveService.localPDs;
  }

  get remotePds(): PocketDrive[] {
    return this.pocketDriveService.remotePDs;
  }

  refresh(): void {
    this.location.back();
  }


}
