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
        });
        this.toBoard()
      })
      .catch((error) => {
        this.wrongPassword()
      });
  }

  setLocalStorage(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    this.usersSubscription.unsubscribe();
  }

  toBoard() {
    setTimeout(() => {
      this.router.navigate(['/board']);
    }, 800);
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
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        this.loggedUser.name = user.displayName
        console.log(this.loggedUser)
        this.setLocalStorage(this.loggedUser)
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
    setTimeout(() => {
      this.toBoard()
    }, 2500);
  }

  getUsers() {
    this.users$ = collectionData(this.usersCollection, { idField: 'id' })
  }
}
