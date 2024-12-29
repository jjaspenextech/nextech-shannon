import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { UserApiService } from '../../services/user-api.service';
import { Integration, integrations } from '../../models/integrations.model';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  availableThemes = ['default-theme', 'dark-theme'];
  currentTheme: string;
  userIntegrations: { [key in Integration]: {value: string, hide?: boolean} };

  constructor(
    private themeService: ThemeService,
    private userApiService: UserApiService
  ) {
    this.currentTheme = this.themeService.getTheme();
    const integrationKeys = Object.keys(integrations);
    this.userIntegrations = integrationKeys.reduce((acc: any, key) => {
      acc[key] = { value: '', hide: true };
      return acc;
    }, {} as { [key in Integration]: {value: string, hide?: boolean} });
  }

  ngOnInit(): void {
    this.loadApiKeys();
  }

  changeTheme(theme: string): void {
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
  }

  loadApiKeys(): void {
    this.userApiService.getApiKeys().subscribe(keys => {
      Object.keys(keys).forEach((key:string) => {
        this.userIntegrations[key as Integration].value = keys[key];
      });
    });
  }

  updateApiKey(service: string, key: string): void {
    this.userApiService.updateApiKey(service, key).subscribe(() => {
      console.log(`API key for ${service} updated successfully.`);
    });
  }

  toggleVisibility(service: string): void {
    const integration = service as Integration;
    this.userIntegrations[integration].hide = !this.userIntegrations[integration].hide;
  }
}
