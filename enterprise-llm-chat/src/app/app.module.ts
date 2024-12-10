import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
// import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ChatComponent } from './chat/chat.component';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';

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
    ChatComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
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
    ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 