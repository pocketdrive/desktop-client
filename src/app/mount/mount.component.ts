import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";
import {platform} from 'os';
import {Samba} from "../models/samba";
import {PocketDrive} from "../models/pocketdrive";
import {User} from "../models/user";
import {exec} from "child_process";

const sudo = require('sudo-prompt');

const options = {
  name: 'Pocket Drive',
  icns: '/Applications/Electron.app/Contents/Resources/Electron.icns',
};

@Component({
  selector: 'app-mount',
  templateUrl: './mount.component.html',
  styleUrls: ['./mount.component.scss']
})
export class MountComponent implements OnInit {

  mountOnOff: boolean;
  samba: Samba;
  pocketDrive: PocketDrive;
  user: User;

  constructor() {
  }

  ngOnInit() {
    this.mountOnOff = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.mountOnOff));
    this.samba = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.mountDetails));
    this.pocketDrive = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd));
    this.user = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser));
  }

  checkBoxClicked(): void {
    LocalStorageService.setItem(Constants.localStorageKeys.mountOnOff, JSON.stringify(!this.mountOnOff));
    this.mount();
  }

  private mount(): void {
    const currentPlatform = platform();

    switch (currentPlatform) {
      case 'win32':
        !this.mountOnOff ? this.mountWindows() : this.unmountWindows();
        break;

      case 'linux':
        !this.mountOnOff ? this.mountLinux() : this.unmountLinux();
        break;

      case 'darwin':
        !this.mountOnOff ? this.mountMac() : this.unmountMac();
        break;
    }
  }

  private mountLinux(): void {
    const command = 'mount -t cifs -o username=' + this.samba.username + ',password=' + this.samba.password + ' //' + this.pocketDrive.ip + '/' + this.user.username + ' ~/PocketDrive';

    // noinspection JSUnusedLocalSymbols
    sudo.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error("Mount failed: ", error);
        this.mountOnOff = !this.mountOnOff;
        LocalStorageService.setItem(Constants.localStorageKeys.mountOnOff, JSON.stringify(this.mountOnOff));
      }
    });
  }

  private unmountLinux(): void {
    const command = 'umount ~/PocketDrive';

    // noinspection JSUnusedLocalSymbols
    sudo.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error("Unmount failed: ", error);
        this.mountOnOff = !this.mountOnOff;
        LocalStorageService.setItem(Constants.localStorageKeys.mountOnOff, JSON.stringify(this.mountOnOff));
      }
    });
  }

  private mountWindows(): void {
    const command = 'net use z: ' + '\\\\' + this.pocketDrive.ip + '\\' + this.user.username + ' /user:' + this.samba.username + ' ' + this.samba.password;

    // noinspection JSUnusedLocalSymbols
    exec(command, function (error, stdout, stderr) {
      if (error) {
        console.error("Mount failed: ", error);
        this.mountOnOff = !this.mountOnOff;
        LocalStorageService.setItem(Constants.localStorageKeys.mountOnOff, JSON.stringify(this.mountOnOff));
      }
    });
  }

  private unmountWindows(): void {
    const command = 'net use z: /delete';

    // noinspection JSUnusedLocalSymbols
    sudo.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error("Unmount failed: ", error);
        this.mountOnOff = !this.mountOnOff;
        LocalStorageService.setItem(Constants.localStorageKeys.mountOnOff, JSON.stringify(this.mountOnOff));
      }
    });
  }

  private mountMac(): void {
    // TODO
  }

  private unmountMac(): void {
    // TODO
  }

}
