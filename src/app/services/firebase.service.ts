import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, authState, User, user } from '@angular/fire/auth';
import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription, map, switchMap, tap } from 'rxjs';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { onValue } from 'firebase/database';
import { getDatabase, ref } from '@angular/fire/database';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {
  private logoVisibility = new BehaviorSubject<boolean>(false);
  logoVisible$ = this.logoVisibility.asObservable();
  usersCollection: any = collection(this.firebase, 'users');
  users$ !: Observable<any>;
  private usersSubscription: Subscription
  filteredUser: Observable<any>;

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
        this.checkIfUserOnline(userCredential.user)
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

  checkIfUserOnline(incommingUser) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;

        console.log(user, 'user is signed in')
      } else {

        console.log(incommingUser, 'user is signed out')
      }
    });
    this.setState(incommingUser)
  }


  filteredUsers: any[] = [];

  setState(incomingUser) {
    this.users$ = collectionData(this.usersCollection, { idField: 'id' });

    this.users$.subscribe(users => {
      console.log(users)
      this.filteredUsers = users.filter(user => user[0].email === incomingUser.email);
      // Verwenden Sie die gefilterten Benutzer in this.filteredUsers
    });
    console.log(this.filteredUsers)
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
        this.checkIfUserOnline(user)
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
