import {Component, OnInit} from '@angular/core';
import {HttpInterceptor} from "../providers/http-interceptor.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {

  url: string;
  safeUrl: SafeHtml;

  constructor(private httpInterceptor: HttpInterceptor,
              private sanitizer: DomSanitizer) {
    let username = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.loggedInuser)).username;
    let ip = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd)).ip;
    this.url = `${httpInterceptor.getUrlWithoutPort()}:4000?username=${username}&ip=${ip}`;
    this.safeUrl = sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  ngOnInit() {
  }

}
