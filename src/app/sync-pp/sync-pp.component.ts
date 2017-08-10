import { Component, OnInit } from '@angular/core';
import {PocketDrive} from "../models/pocketdrive";

/*const LINKS = [
  [{name: 'Office PD', uuid: '1001', ip: '192.168.8.100', port: '3000'}, {name: 'Home PD', uuid: '1002', ip: '248.112.30.12', port: '3000'}],
  [{name: 'Floor 1', uuid: '1101', ip: '192.168.1.1', port: '3000'}, {name: 'Floor 2', uuid: '1001', ip: '192.168.1.10', port: '3000'}]
];*/

const od = {name: 'Office PD', uuid: '1001', ip: '192.168.8.100', port: '3000'};

@Component({
  selector: 'app-sync-pp',
  templateUrl: './sync-pp.component.html',
  styleUrls: ['./sync-pp.component.scss']
})
export class SyncPdPdComponent implements OnInit {

  /*links: PocketDrive[][];
  p: PocketDrive*/

  constructor() {
    // this.links = LINKS;
  }

  ngOnInit() {
  }

}
