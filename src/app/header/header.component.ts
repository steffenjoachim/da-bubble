import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(
    private firebase: FirebaseService,
    private afAuth: Auth
  ) {
    this.setCurrentUser();
  }

  async setCurrentUser() {
    const user = await this.afAuth.currentUser;
    const currentUserName = document.getElementById("current-user-name");
    const currentUserImg = document.getElementById("current-user-img") as HTMLImageElement; 
    if (currentUserName) {
      if (user) {
        console.log('User exists. Name:', user.displayName || 'No name available');
      } else {
        currentUserName.innerHTML = 'Guest';
        currentUserImg.src = './assets/img/Profile.png'; 
      }
    }
  }
}
