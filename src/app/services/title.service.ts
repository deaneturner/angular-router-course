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
      if (titles.length) {
        this.routeTitles = titles;
        // const myTemplate = `${0}${1}${0}!`;
        // const labelTemplate = this.template(myTemplate);
        this.title.setTitle(titles.map((t) => t.label).join(': '));
      }
    });
  }
  public routeTitles;

  static template(strings, ...keys) {
    return (function (...values) {
      const dict = values[values.length - 1] || {};
      const result = [strings[0]];
      keys.forEach(function (key, i) {
        const value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });
      return result.join('');
    });
  }

  setTitle(title?: string) {
    this.title.setTitle(this.routeTitles.map((t) => t.label).join(': '));
  }

  templateTest() {
    const t1Closure = TitleService.template`${0}${1}${0}!`;
    // let t1Closure = template(["","","","!"],0,1,0);
    t1Closure('Y', 'A');                      // "YAY!"

    const t2Closure = TitleService.template`${0} ${'foo'}!`;
    // let t2Closure = template([""," ","!"],0,"foo");
    t2Closure('Hello', {foo: 'World'}); // "Hello World!"

    const t3Closure = TitleService.template`I'm ${'name'}. I'm almost ${'age'} years old.`;
    // let t3Closure = template(["I'm ", ". I'm almost ", " years old."], "name", "age");
    t3Closure('foo', {name: 'MDN', age: 30}); // "I'm MDN. I'm almost 30 years old."
    t3Closure({name: 'MDN', age: 30}); // "I'm MDN. I'm almost 30 years old."
  }
}
