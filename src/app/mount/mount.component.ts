import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";
import {MountService} from "../providers/mount.service";

@Component({
  selector: 'app-mount',
  templateUrl: './mount.component.html',
  styleUrls: ['./mount.component.scss']
})
export class MountComponent implements OnInit {

  constructor(private mountService: MountService) {
  }

  ngOnInit() {
  }

  get mountOnOff(): boolean {
    return this.mountService.mountOnOff;
  }

  set mountOnOff(value: boolean) {
    this.mountService.mountOnOff = value;
    // LocalStorageService.setItem(Constants.localStorageKeys.mountOnOff, JSON.stringify(this.mountOnOff));
    this.mountOnOff ? this.mountService.mount() : this.mountService.unmount();
  }

  get autoMount(): boolean {
    return this.mountService.autoMount;
  }

  set autoMount(value: boolean) {
    this.mountService.autoMount = value;
    LocalStorageService.setItem(Constants.localStorageKeys.autoMount, JSON.stringify(this.autoMount));

    if (value && !this.mountOnOff) {
      this.mountOnOff = true;
    }
  }

}
