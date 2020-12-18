import {Component, OnInit} from '@angular/core';
import {AuthStore} from './services/auth.store';
// TODO: document
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
// END TODO

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements  OnInit {
    // TODO: document
    constructor(
      public auth: AuthStore,
      private titleService: Title,
      private router: Router,
      private activatedRoute: ActivatedRoute) {
    }
    // END TODO

    ngOnInit() {

      // TODO: document, package
      const appTitle = this.titleService.getTitle();
      this.router
        .events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child.firstChild) {
            child = child.firstChild;
          }
          if (child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return appTitle;
        })
      ).subscribe((ttl: string) => {
        this.titleService.setTitle(ttl);
      });
      // END TODO

    }

  logout() {
        this.auth.logout();

  }

}
