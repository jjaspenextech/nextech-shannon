import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div class="app-container"><router-outlet></router-outlet></div>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'enterprise-llm-chat';
}
