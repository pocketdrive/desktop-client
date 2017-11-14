import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from "../models/user";
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";
import {SyncService} from "../providers/sync.service";
import {MountService} from "../providers/mount.service";
import {NisService} from "../providers/nis.service";
import {PocketDrive} from "../models/pocketdrive";
import Databases from "../db/dbs";
import {environment} from "environments";

const ipc = require('electron').ipcRenderer;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: User;
  count: number = 0;
  pocketDrive: PocketDrive;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private syncService: SyncService,
              private nisService: NisService,
              private mountService: MountService) {
    HomeComponent.loadAdminLTEScripts();

    this.mountService.init();
    this.nisService.init();
    this.syncService.init();
    Databases.init();

    this.pocketDrive = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd));

    // Loading environment varibales from local storage and setting it to memory.
    environment['PD_FOLDER_PATH'] = LocalStorageService.getItem(Constants.localStorageKeys.PD_FOLDER_PATH);
    environment['NE_DB_PATH_CHECKSUM'] = LocalStorageService.getItem(Constants.localStorageKeys.NE_DB_PATH_CHECKSUM);
    environment['NE_DB_PATH_SYNC_METADATA'] = LocalStorageService.getItem(Constants.localStorageKeys.NE_DB_PATH_SYNC_METADATA);

  }

  ngOnInit() {
    this.user = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser));
    this.router.navigate(['explorer'], {relativeTo: this.activatedRoute});

    // Signout dialog action buttons
    ipc.on('signout-dialog-selection', (event, index) => {
      if (index === 0) {
        this.signOut();
      }
    });

    // Intiate tasks to do after signing in.
    setTimeout(() => {
      // Mount with PD
      if (this.mountService.autoMount) {
        this.mountService.mount();
      }

      this.syncService.startSync();
      this.nisService.start();
    }, 2000);

  }

  signOut(): void {
    this.syncService.stopSync();
    this.nisService.stopNis();

    if (this.mountService.autoMount || this.mountService.mountOnOff) {
      this.mountService.unmount().then(() => {
        this.router.navigate(['']);
      });
    } else {
      this.router.navigate(['']);
    }
  }

  static loadAdminLTEScripts() {
    let node = document.createElement('script');
    node.src = "../src/js/app.min.js";
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  showSignOutDialog(): void {
    ipc.send('open-signout-dialog');
  }
}
