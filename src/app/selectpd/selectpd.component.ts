import { Component, OnInit } from '@angular/core';

import { PocketDrive } from "../models/pocketdrive";
import { PocketDriveService } from "../providers/pd.service";

const PDS = {
  local : [
    { uuid: '0001', name: 'Ground Floor', ip: '192.168.8.2', port:3000 },
    { uuid: '0003', name: 'Top Floor', ip: '192.168.8.5', port:3000 }
  ],
  remote : [
    { uuid: '0001', name: 'Home Device', ip: '192.168.8.2', port:3000 }
  ]
}

@Component({
  selector: 'app-selectpd',
  templateUrl: './selectpd.component.html',
  styleUrls: ['./selectpd.component.scss']
})

export class SelectpdComponent implements OnInit {

   localPds : PocketDrive[];
   remotePds : PocketDrive[];

  constructor(private pocketDriverService: PocketDriveService) { }

  ngOnInit() {
    // this.pocketDriverService.discoverPds()
    //   .then(pds => this.pds);

    this.localPds = PDS.local;
    this.remotePds = PDS.remote;
  }

}
