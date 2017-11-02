import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from "../models/user";
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";
import {SyncService} from "../providers/sync.service";
import {MountService} from "../providers/mount.service";
import {NisService} from "../providers/nis.service";

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
              private nisService:NisService,
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
