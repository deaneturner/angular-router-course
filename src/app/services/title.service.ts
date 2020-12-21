import { Injectable, OnDestroy } from '@angular/core';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';

/*
 * Title Configuration
 *
 * Interface for an object literal definition - see getter titleConfig.
 */
interface TitleConfig {
  template?: Function;
  titles: {
    label: string;
    resolved?: Object;
  }[];
  getTitle: Function;
  setTitles: Function;
}

/**
 * # Title Configuration for Routing
 * Provide this configuration in the 'data' portion of the appropriate route configuration, and
 * the Angular title service will be used set the browser page title (and tab) with a computed label.
 *
 * Note: Labels must be applied consistently, from a parent down.  Otherwise, navigating to a parent node could
 * result in the previous label being misapplied.
 *
 * - providing a template (advanced) will invoke access to the titles array, and will allow a string template
 * to access the hierarchy of nested routes and resolver data.
 *
 * ## Simple Label
 * Provide a label value to be used as a title.  This label will be captured for advanced usage
 * (see below) and stored in titles array.
 *
 * ```javascript
 * {
 *    path: '',
 *    component: CoursesComponent,
 *    data: {
 *      title: {
 *        label: 'Courses'
 *      }
 *    }
 *  },
 * ```
 *
 * ## Advanced
 *  Advanced usage involves applying the captured title array to a string template.  The presence of
 *  a template will invoke access to the array, otherwise the current activated route label will be used.
 *
 * ## Captured Label Array
 *  - the parent and current labels are available (e.g. TitleService.template`{1}: ${2})
 *  - the current resolver label (e.g. TitleService.template`...${3})
 *  - the parent resolver label is available (e.g. TitleService.template`${1}...)
 *
 *  ## Resolvers
 *  To devise a label from an resolver, provide the name and field in the resolvers property.  They will be used to construct
 *  a label and store it in the titles array.
 *
 * ```javascript
 * {
        path: 'lessons/:lessonSeqNo',
        component: LessonDetailComponent,
        resolve: {
          lesson: LessonDetailResolver
        },
        data: {
          title: {
            label: 'Lesson Detail Component',
            template: TitleService.template`${1}: ${3}`,
            resolvers: [{
              resolver: 'lesson',
              itemKey: 'description'
            }]
          }
        }
 * },
 * ```
 */
interface RouteTitleConfig {
  label: string;
  template?: Function;
  resolvers?: {
    resolver: string;
    itemKey: string;
  }[];
}

/**
 * Title Service
 *
 * A singleton service: uses the Angular title service to apply a title to the current page,
 * thus updating the browser's tab as well.
 *
 * Configuration:
 *  - include at a top level module (constructor subscribes to route events)
 *  - bind titles to route configurations using RouteTitleConfig interface entries
 */
@Injectable({
  providedIn: 'root',
})
export class TitleService implements OnDestroy {

  private unsubscribe$ = new Subject<void>();

  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    /*
     * On router events, set the browser tab label using the TitleService.
     */
    this.routerEvents$.subscribe((titleConfig) => {
      this.setTitle(titleConfig.getTitle());
    });
  }

  /*
   * Observable router events
   *  - set titles (browser tabs labels) obtained from activated route
   */
  private routerEvents$: Observable<TitleConfig> = this.router
    .events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        return this.titleConfig.setTitles();
      }),
      takeUntil(this.unsubscribe$)
    );

  /**
   * Return a Title Configuration
   *
   * Note: the notion of a closure is purposely used here, instead of a applying a concrete class.
   *
   * @returns titleConfig {TitleConfig} The title configuration object.
   */
  get titleConfig(): TitleConfig {
    const configClosure: TitleConfig = {
      template: null,
      titles: [{
        label: this.title.getTitle()
      }],
      getTitle: () => {
        let title: string;
        if (configClosure.titles.length) {
          if (configClosure.template) {
            // presence of a template will invoke usage of the captured titles array
            title = (configClosure.template(...configClosure.titles.map((t) => t.label)));
          } else {
            // otherwise, use the label provided directly on the current activated route
            title = configClosure.titles[0].label;
          }
        }
        return title;
      },
      /**
       * Set Titles
       *
       * Read the activated route event's data payload
       *  - update the config object with relevant data.
       *
       * Relevant data is:
       * 1) the current route label on the route config
       * 2) any additional labels given by parent or child routes
       * 3) any additional labels given by a route resolver, as configured
       * in the RouteTitleConfig resolvers property.
       *
       * @returns titleConfig {TitleConfig} The updated title configuration object.
       */
      setTitles: () => {
        const titleConfigs: {
          label: string;
          resolved?: Object;
        }[] = [];
        let child = this.activatedRoute.firstChild;
        let routeTitleConfig: RouteTitleConfig;
        let resolvers;
        while (child.firstChild) {
          child = child.firstChild;
          routeTitleConfig = child.snapshot.data.title;
          if (routeTitleConfig) {
            // route title config
            titleConfigs.push({
              label: routeTitleConfig.label
            });
            if (routeTitleConfig.template) {
              // parent of this method is referenced here using its declaration "config"
              configClosure.template = routeTitleConfig.template;
            }
            // resolvers
            resolvers = routeTitleConfig.resolvers;
            if (resolvers) {
              resolvers.forEach((resolve => {
                if (resolve.resolver && resolve.itemKey) {
                  titleConfigs.push({
                    label: child.snapshot.data[resolve.resolver][resolve.itemKey],
                    resolved: child.snapshot.data[resolve.resolver]
                  });
                }
              }));
            }
          }
        }
        if (routeTitleConfig) {
          configClosure.titles = titleConfigs;
        }
        return configClosure;
      }
    };
    return configClosure;
  }

  /**
   * Template
   *
   * A tag function used to specify string replacements according to a given string
   * and an array of label values.
   *
   *```javascript
   * const t1Closure = TitleService.template`${0}${1}${0}!`;
   * // let t1Closure = TitleService.template(["","","","!"],0,1,0);
   * t1Closure('Y', 'A');                      // "YAY!"
   *
   * const t2Closure = TitleService.template`${0} ${'foo'}!`;
   * // let t2Closure = TitleService.template([""," ","!"],0,"foo");
   * t2Closure('Hello', {foo: 'World'}); // "Hello World!"
   *
   * const t3Closure = TitleService.template`I'm ${'name'}. I'm almost ${'age'} years old.`;
   * // let t3Closure = TitleService.template(["I'm ", ". I'm almost ", " years old."], "name", "age");
   * t3Closure('foo', {name: 'MDN', age: 30}); // "I'm MDN. I'm almost 30 years old."
   * t3Closure({name: 'MDN', age: 30}); // "I'm MDN. I'm almost 30 years old."
   * ```
   *
   * @param strings
   * @param keys
   */
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

  /**
   * Set the browser title (tab) to the label value given.
   *
   * @param label
   */
  setTitle(label?: string) {
    if (label) {
      this.title.setTitle(label);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
