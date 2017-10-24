import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {User} from "../models/user";
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";
import {SyncService} from "../providers/sync.service";
import {MountService} from "../providers/mount.service";

const ipc = require('electron').ipcRenderer

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: User;
  count: number = 0;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private syncService: SyncService,
              private mountService: MountService) {
    HomeComponent.loadAdminLTEScripts();
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

    setTimeout(() => {
      // Mount with PD
      if (this.mountService.mountOnOff && this.mountService.autoMount) {
        this.mountService.mount();
      }

      // Start Client-PD sync
      // this.syncService.startSync(); //TODO: uncomment this line
    }, 2000);

  }

  signOut(): void {
    /*this.syncService.stopSync();
    this.mountService.unmount().then(() => {
      this.router.navigate(['']);
    });*/

    this.router.navigate(['']);
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
