import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: User | null = null;

  constructor(private cookieService: CookieService) {}

  setUser(user: User) {
    this.currentUser = user;
    // Store in cookies for persistence
    this.cookieService.set('username', user.username, 1, '/');
    this.cookieService.set('firstName', user.firstName, 1, '/');
    this.cookieService.set('lastName', user.lastName, 1, '/');
    this.cookieService.set('email', user.email, 1, '/');
  }

  getUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to reconstruct from cookies
    const username = this.cookieService.get('username');
    if (username) {
      this.currentUser = {
        username,
        firstName: this.cookieService.get('firstName'),
        lastName: this.cookieService.get('lastName'),
        email: this.cookieService.get('email')
      };
      return this.currentUser;
    }

    return null;
  }

  clearUser() {
    this.currentUser = null;
    this.cookieService.delete('username', '/');
    this.cookieService.delete('firstName', '/');
    this.cookieService.delete('lastName', '/');
    this.cookieService.delete('email', '/');
    this.cookieService.delete('authToken', '/');
  }
} 