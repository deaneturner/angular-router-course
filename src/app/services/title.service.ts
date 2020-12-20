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
    this.router
      .events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        const result = {
          templates: {
            label: null,
            children: []
          },
          titles: [{
            label: this.title.getTitle()
          }]
        };
        let child = this.activatedRoute.firstChild;
        const titles = [];
        while (child.firstChild) {
          child = child.firstChild;
          if (child.snapshot.data['title']) {
            // route title config
            titles.push(child.snapshot.data['title']);
            if (child.snapshot.data['title'].template) {
              if (!result.templates.label) {
                result.templates.label = child.snapshot.data['title'].template;
              } else {
                result.templates.children.push(child.snapshot.data['title'].template);
              }
            }
            // resolvers
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
          }
        }
        if (child.snapshot.data['title']) {
          result.titles = titles;
        }
        return result;
      })
    ).subscribe((config) => {
      if (config.titles.length) {
        if (config.templates.label) {
          this.setTitle(config.templates.label(...config.titles.map((t) => t.label)));
        } else {
          this.setTitle(config.titles[0].label);
        }
      }
    });
  }

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

  setTitle(label?: string) {
    if (label) {
      this.title.setTitle(label);
    }
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
