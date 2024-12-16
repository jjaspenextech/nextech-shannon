import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    private router: Router,
    private cookieService: CookieService
  ) {}

  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  logout(): void {
    this.cookieService.delete('authToken', '/');
    this.router.navigate(['/login']);
  }
} 