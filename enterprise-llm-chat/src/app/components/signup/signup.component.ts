import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserApiService } from '../../services/user-api.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  public username: string = '';
  public password: string = '';
  public confirmPassword: string = '';
  public email: string = '';
  public firstName: string = '';
  public lastName: string = '';
  public errorMessage: string = '';
  public usernameError: string = '';
  public passwordError: string = '';
  public signupCode: string = '';
  public signupCodeError: string = '';

  constructor(
    private userApiService: UserApiService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    } else {
      this.passwordError = '';
    }

    const userData = {
      username: this.username,
      password: this.password,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      signupCode: this.signupCode
    };

    this.userApiService.signup(userData).subscribe(
      response => {
        console.log('Signup successful', response);
        this.cookieService.set('authToken', response.token, 1, '/');
        this.router.navigate(['/chat']);
      },
      error => {
        console.error('Signup failed', error);
        if (error.status === 401) {
          this.signupCodeError = 'Invalid signup code';
          this.errorMessage = '';
        } else if (error.status === 400 && error.error.detail === 'User already exists') {
          this.usernameError = 'Username already exists. Please choose another one.';
          this.errorMessage = '';
        } else {
          this.errorMessage = 'An error occurred during signup. Please try again later.';
          this.usernameError = '';
        }
      }
    );
  }

  cancel() {
    this.router.navigate(['/login']);
  }
}
