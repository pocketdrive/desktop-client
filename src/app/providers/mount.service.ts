import {Injectable} from '@angular/core';
import {Samba} from "../models/samba";
import {PocketDrive} from "../models/pocketdrive";
import {User} from "../models/user";
import {LocalStorageService} from "./localstorage.service";
import {platform} from 'os';
import {exec} from "child_process";
import {Constants} from "../constants";

const sudo = require('sudo-prompt');

const options = {
  name: 'Pocket Drive',
  icns: '/Applications/Electron.app/Contents/Resources/Electron.icns',
};

@Injectable()
export class MountService {

  autoMount: boolean;
  mountOnOff: boolean;
  samba: Samba;
  pocketDrive: PocketDrive;
  user: User;

  constructor() {
    this.autoMount = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.autoMount));
    this.mountOnOff = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.autoMount));
    // this.mountOnOff = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.mountOnOff));
    this.samba = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.mountDetails));
    this.pocketDrive = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd));
    this.user = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser));
  }

  mount(): void {
    const currentPlatform = platform();

    switch (currentPlatform) {
      case 'win32':
        this.mountWindows();
        break;

      case 'linux':
        this.mountLinux();
        break;

      case 'darwin':
        this.mountMac();
        break;
    }
  }

  unmount(): Promise<any> {
    const currentPlatform = platform();

    switch (currentPlatform) {
      case 'win32':
        this.unmountWindows();
        break;

      case 'linux':
        return this.unmountLinux();

      case 'darwin':
        this.unmountMac();
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

  private unmountLinux(): Promise<any> {
    const command = 'umount ~/PocketDrive';

    return new Promise((resolve) => {
      // noinspection JSUnusedLocalSymbols
      sudo.exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error("Unmount failed: ", error);
          this.mountOnOff = !this.mountOnOff;
          LocalStorageService.setItem(Constants.localStorageKeys.mountOnOff, JSON.stringify(this.mountOnOff));
        } else {
          resolve(error);
        }
      });
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
