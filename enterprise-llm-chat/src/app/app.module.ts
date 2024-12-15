import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

// import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
// import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { AppComponent } from './components/app.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatService } from './services/chat.service';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { LandingComponent } from './components/landing/landing.component';
import { AppRoutingModule } from './app.routes';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { ApiKeyModalComponent } from './components/api-key-modal/api-key-modal.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectService } from './services/project.service';
import { ProjectCreateComponent } from './components/project-create/project-create.component';
import { SideDashboardComponent } from './components/side-dashboard/side-dashboard.component';
import { ProjectEditComponent } from './components/project-edit/project-edit.component';
// function MSALInstanceFactory() {
//   return new PublicClientApplication({
//     auth: {
//       clientId: 'your-client-id', // Replace with your Azure AD app client ID
//       authority: 'https://login.microsoftonline.com/your-tenant-id', // Replace with your Azure AD tenant ID
//       redirectUri: 'http://localhost:4200'
//     }
//   });
// }

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    LoginComponent,
    SignupComponent,
    LandingComponent,
    ApiKeyModalComponent,
    ProjectListComponent,
    ProjectCreateComponent,
    SideDashboardComponent,
    ProjectEditComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatFormFieldModule,
    // MsalModule.forRoot({
    //   interactionType: InteractionType.Redirect,
    //   authRequest: {
    //     scopes: ['user.read']
    //   }
    // }, null, null)
  ],
  providers: [
    // {
    //   provide: MSAL_INSTANCE,
    //   useFactory: MSALInstanceFactory
    // },
    // MsalService
    ChatService,
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ProjectService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 