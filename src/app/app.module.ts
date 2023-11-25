import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { BoardComponent } from './board/board.component';
import { HeaderComponent } from './header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { BoardSidebarComponent } from './board-sidebar/board-sidebar.component';
import { BoardThreadComponent } from './board-thread/board-thread.component';
import { BoardContentComponent } from './board-content/board-content.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { DialogAddMembersComponent } from './dialog-add-members/dialog-add-members.component';
import { MatMenuModule } from '@angular/material/menu';
import { DialogChannelInfoComponent } from './dialog-channel-info/dialog-channel-info.component';
import { DialogShowEmojisComponent } from './dialog-show-emojis/dialog-show-emojis.component';
import { DialogChannelReactionsComponent } from './dialog-channel-reactions/dialog-channel-reactions.component';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { DialogSelectMembersComponent } from './dialog-select-members/dialog-select-members.component';


registerLocaleData(localeDe);

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    BoardComponent,
    HeaderComponent,
    BoardSidebarComponent,
    BoardThreadComponent,
    BoardContentComponent,
    ChannelChatComponent,
    DialogAddMembersComponent,
    DialogChannelInfoComponent,
    DialogShowEmojisComponent,
    DialogChannelReactionsComponent,
    DialogSelectMembersComponent,
  ],
  imports: [
    MatMenuModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
    MatSidenavModule,
    MatTreeModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),

  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de' }],
  bootstrap: [AppComponent],
})
export class AppModule { }
