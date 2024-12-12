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

// import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
// import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { ChatService } from './services/chat.service';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { LandingComponent } from './landing/landing.component';
import { AppRoutingModule } from './app.routes';
import { AuthInterceptor } from './services/auth-interceptor.service';
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
    LandingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    AppRoutingModule
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
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 