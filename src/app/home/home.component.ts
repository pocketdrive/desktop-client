import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpInterceptor} from "../providers/http-interceptor.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
    HomeComponent.loadAdminLTEScripts();
  }

  ngOnInit() {
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
