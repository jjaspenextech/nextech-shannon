import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly publicPaths = [
    '/signup/',
    '/login/'
  ];

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth token for public paths
    if (this.isPublicPath(request.url)) {
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
    }

    const authToken = this.cookieService.get('authToken');
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isPublicPath(request.url)) {
          // Clear the token and redirect only for protected routes
          this.cookieService.delete('authToken');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicPath(url: string): boolean {
    return this.publicPaths.some(path => url.includes(path));
  }
} 