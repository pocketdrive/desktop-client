import {Component, OnInit} from '@angular/core';
import {PocketDriveService} from "../providers/pd.service";

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  constructor(private pocketDriveService: PocketDriveService) {
    this.pocketDriveService.init();
  }

  ngOnInit() {
    this.pocketDriveService.listenForPDs();
  }

}
