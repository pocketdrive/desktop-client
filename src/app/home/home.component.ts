import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {User} from "../models/user";
import {LocalStorageService} from "../providers/localstorage.service";
import {Constants} from "../constants";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: User;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private localStorageService: LocalStorageService) {
    HomeComponent.loadAdminLTEScripts();
  }

  ngOnInit() {
    this.user = this.localStorageService.getItem(Constants.localStorageKeys.loggedInuser);
    this.router.navigate(['explorer'], {relativeTo: this.activatedRoute});
  }

  static loadAdminLTEScripts() {
    let node = document.createElement('script');
    node.src = "../src/js/app.min.js";
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

}
