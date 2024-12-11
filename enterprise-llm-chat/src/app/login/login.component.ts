import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserApiService } from '../services/user-api.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private userApiService: UserApiService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  onSubmit() {
    this.userApiService.login({ username: this.username, password: this.password }).subscribe(
      response => {
        console.log('Login successful', response);
        this.cookieService.set('authToken', response.token, 1, '/');
        this.router.navigate(['/chat']);
      },
      error => {
        console.error('Login failed', error);
        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again later.';
        }
      }
    );
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
} 