import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    let result = [this.title.getTitle()];
    this.router
      .events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        const titles = [];
        while (child.firstChild) {
          child = child.firstChild;
          if (child.snapshot.data['title']) {
            const resolvers = child.snapshot.data['title'].resolvers;
            if (resolvers) {
              resolvers.forEach((config => {
                if (config.resolver && config.itemKey) {
                  titles.push({
                    label: child.snapshot.data[config.resolver][config.itemKey],
                    resolved: child.snapshot.data[config.resolver]
                  });
                }
              }));
            }
            titles.push(child.snapshot.data['title']);
          }
        }
        if (child.snapshot.data['title']) {
          result = titles;
        }
        return result;
      })
    ).subscribe((titles: Array<any>) => {
      this.title.setTitle(titles.map((t) => t.label).join(': '));
    });
  }

  setTitle(title: string) {
    this.title.setTitle(title);
  }
}
