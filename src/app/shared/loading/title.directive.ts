import { Directive, Input, OnInit } from '@angular/core';
import { TitleService } from '../../services/title.service';

@Directive({
  selector: '[appTitle]'
})
export class TitleDirective implements OnInit {
  @Input() label: string;

  constructor(private titleService: TitleService) {
  }

  ngOnInit() {
    this.titleService.setTitle(this.label);
  }
}
