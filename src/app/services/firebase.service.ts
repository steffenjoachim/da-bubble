import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {
  private logoVisibility = new BehaviorSubject<boolean>(false);
  logoVisible$ = this.logoVisibility.asObservable();
  usersCollection: any = collection(this.firebase, 'users');
  users$ !: Observable<any>;

  private usersSubscription: Subscription

  loggedUser: any = {
    avatar: './assets/img/avatarinteractionmobile3.png',
    name: ''
  }

  constructor(public firebase: Firestore,
    private router: Router) {
    this.getUsers()
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  setLogoVisible(visible: boolean): void {
    this.logoVisibility.next(visible);
  }

  addUser(email: string, password: string, users: any) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        addDoc(this.usersCollection, users)
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          alert('Diese E-Mail-Adresse wird bereits verwendet.');
        } else {
          alert('Fehler beim Hinzufügen des Benutzers. Versuche bitte erneut');
        }
      });
  }

  loginUser(email: string, password: string) {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        this.users$ = collectionData(this.usersCollection, { idField: 'id' });
        this.usersSubscription = this.users$.subscribe(async (usersArray) => {
          const userWithEmail = usersArray.find(user => user.email === userCredential.user.email);
          const userData = {
            avatar: userWithEmail.avatar,
            name: userWithEmail.name
          };
          this.setLocalStorage(userData)
          this.router.navigate(['/board']);
        });
      })
      .catch((error) => {
        this.wrongPassword()
      });
  }

  setLocalStorage(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  wrongPassword() {
    let wrongPassword = document.getElementById('wrong');
    wrongPassword.innerHTML = 'E-Mail oder Passwort ungültig'
  }

  loginWithGoogle() {
    const auth = getAuth();
    auth.languageCode = 'de';
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        this.loggedUser.name = user.displayName;
        this.setLocalStorage(this.loggedUser);
        this.router.navigate(['/board']);
      })
      .catch((error) => {
        console.error('Fehler bei der Google-Authentifizierung:', error);
      });
  }

  getUsers() {
    this.users$ = collectionData(this.usersCollection, { idField: 'id' })
  }
}
