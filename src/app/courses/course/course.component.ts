import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Course} from '../model/course';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {

  course: Course;
  title: Observable<string>;

  couponCode: string;

  constructor(private route: ActivatedRoute) {
    this.title = route.data.pipe(
      map(d => d.title)
    );
  }


  ngOnInit() {

      this.course = this.route.snapshot.data["course"];

      this.couponCode = this.route.snapshot.queryParamMap.get("couponCode");

  }

  confirmExit() {
      return confirm(`Are you sure you want to exit ${this.course.description}?`)
  }


}











