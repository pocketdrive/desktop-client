import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private activatedRoute:ActivatedRoute) { }

  ngOnInit() {
    this.router.navigate(['explorer'], { relativeTo: this.activatedRoute });
  }

}