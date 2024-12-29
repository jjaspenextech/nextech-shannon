import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-root',
  template: '<div class="app-container"><router-outlet></router-outlet></div>',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private themeService: ThemeService) {
    // The ThemeService is now instantiated when the app starts
  }

  title = 'enterprise-llm-chat';
}
