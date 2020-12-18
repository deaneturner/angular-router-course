import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {LessonDetail} from "../model/lesson-detail";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'lesson',
  templateUrl: './lesson-detail.component.html',
  styleUrls: ['./lesson-detail.component.css']
})
export class LessonDetailComponent implements OnInit {

  lesson$: Observable<LessonDetail>;
  title: Observable<string>;

  constructor(private route: ActivatedRoute, private router: Router) {

    console.log('Created LessonDetailComponent...');

    this.title = route.data.pipe(
      map(d => d.title.label)
    );

  }

  ngOnInit() {

      this.lesson$ = this.route.data.pipe(map(data => data["lesson"]));

  }

    previous(lesson: LessonDetail) {

      this.router.navigate(['lessons', lesson.seqNo - 1],
          {relativeTo: this.route.parent});

    }


    next(lesson: LessonDetail) {

        this.router.navigate(['lessons', lesson.seqNo + 1],
            {relativeTo: this.route.parent});

    }
}
