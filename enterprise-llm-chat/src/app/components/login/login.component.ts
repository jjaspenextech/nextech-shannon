import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserApiService } from '../../services/user-api.service';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ThemeService } from 'app/services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public username: string = '';
  public password: string = '';
  public errorMessage: string = '';
  public isLoading: boolean = false;

  constructor(
    private userApiService: UserApiService,
    private router: Router,
    private cookieService: CookieService,
    private userService: UserService,
    private themeService: ThemeService
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userApiService.login({ username: this.username, password: this.password }).subscribe(
      response => {
        console.log('Login successful', response);
        this.cookieService.set('authToken', response.token, 15, '/');
        this.userService.setUser({
          username: response.username,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email
        });
        this.router.navigate(['/landing']);
      },
      error => {
        this.isLoading = false;
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