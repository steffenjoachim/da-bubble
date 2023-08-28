import { Inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private logoVisibility = new BehaviorSubject<boolean>(false);
  logoVisible$ = this.logoVisibility.asObservable();
  usersCollection: any = collection(this.firebase, 'users');

  constructor(public firebase: Firestore, private auth:Auth, private afAuth: Auth) { }

  users = {
    email: '',
    password: ''
  }

  setLogoVisible(visible: boolean):void{
    this.logoVisibility.next(visible);
  }

  addUser(userData: any) {
    addDoc(this.usersCollection, userData)
  }

  async setCurrentUser() {
    const user = await this.afAuth.currentUser;
    const currentUserName = document.getElementById("current-user-name");
    const currentUserImg = document.getElementById("current-user-img") as HTMLImageElement; // Cast to HTMLImageElement
    if (currentUserName) {
      if (user) {
        console.log('User exists. Name:', user.displayName || 'No name available');
      } else {
        currentUserName.innerHTML = 'Guest';
        currentUserImg.src = './assets/img/Profile.png'; // Use lowercase 'src'
      }
    }
  }
}
