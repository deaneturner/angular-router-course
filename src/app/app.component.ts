import {Component, OnInit} from '@angular/core';
import {AuthStore} from './services/auth.store';
import { TitleService } from './services/title.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements  OnInit {

  constructor(
    public auth: AuthStore,
    public titles: TitleService) {
  }

    ngOnInit() {


    }

  logout() {
        this.auth.logout();

  }

}
