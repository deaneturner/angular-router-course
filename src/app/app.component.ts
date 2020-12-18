import { Component, OnInit } from '@angular/core';
import { AuthStore } from './services/auth.store';
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
export class AppComponent implements OnInit {
  // TODO: document
  public title;

  constructor(
    public auth: AuthStore,
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  // END TODO

  ngOnInit() {

    // TODO: document, package
    let result = [this.titleService.getTitle()];
    this.router
      .events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        const titles = [];
        while (child.firstChild) {
          child = child.firstChild;
          if (child.snapshot.data['title']) {
            titles.push(child.snapshot.data['title']);
          }
        }
        if (child.snapshot.data['title']) {
          result = titles;
        }
        return result;
      })
    ).subscribe((titles: Array<string>) => {
      this.titleService.setTitle(titles.join(': '));
    });
    // END TODO

  }

  logout() {
    this.auth.logout();
  }

}
