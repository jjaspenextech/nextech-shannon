import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserApiService } from './user-api.service';

export interface Theme {
    name: string;
    properties: {
      [key: string]: string;
    };
  }

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject: BehaviorSubject<string>;
  public currentTheme$;
  private availableThemes: string[] = ['default-theme', 'dark-theme'];

  constructor(private userApiService: UserApiService) {
    // Initialize with a default theme or fetch from local storage
    const savedTheme = localStorage.getItem('theme') || 'default-theme';
    this.currentThemeSubject = new BehaviorSubject<string>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    this.loadSavedTheme();
    this.initSystemThemeListener();
  }

  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && this.availableThemes.includes(savedTheme)) {
      this.applyTheme(savedTheme);
    } else {
      this.applyThemeBasedOnSystemPreference();
    }
  }

  private initSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? 'dark-theme' : 'default-theme');
      }
    });
  }

  setTheme(theme: string): void {
    // Update the theme on the server
    this.userApiService.updateUserTheme(theme)
    .subscribe({
      next: () => {
        console.log('Theme updated successfully on the server');
        this.applyTheme(theme);
      },
      error: (err) => console.error('Error updating theme on the server', err)
    });
  }

  private applyThemeBasedOnSystemPreference(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(prefersDark ? 'default-theme' : 'default-theme');
  }

  getTheme(): string {
    return this.currentThemeSubject.value;
  }

  private applyTheme(theme: string): void {
    // Remove all theme classes
    this.availableThemes.forEach(theme => {
        document.body.classList.remove(`${theme}`);
    });

    // Add new theme class
    document.body.classList.add(`${theme}`);

    localStorage.setItem('theme', theme);

    // Update the theme in the service
    this.currentThemeSubject.next(theme);
  }
}
