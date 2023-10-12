import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, authState, User, user } from '@angular/fire/auth';
import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
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
  userWithEmail: any;


  loggedUser: any = {
    avatar: './assets/img/avatarinteractionmobile3.png',
    name: ''
  }

  user = {
    name: '',
    email: '',
    avatar: '',
    online: true
  };
  collection: any;

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
    let state: boolean
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        state = true;
        const uid = user.uid;
        this.setState(incommingUser, state)
      } else {
        state = false;
        this.setState(incommingUser, state)
      }
    });
  }

  async setState(incomingUser, state) {
    this.users$ = collectionData(this.usersCollection, { idField: 'id' });
    this.users$ = this.users$.pipe(
      map(users => users.filter(user => user.email == incomingUser.email)),
    );
    let firstSubscribe = true;
    this.usersSubscription = this.users$.subscribe(async (usersArray) => {
      this.userWithEmail = usersArray.find(user => user.email === incomingUser.email);
      if (firstSubscribe) {
        firstSubscribe = false
        const userRef = doc(this.firebase, 'users', this.userWithEmail.id);
        if (this.userWithEmail) {
          await setDoc(userRef, { online: state }, { merge: true });
        }
      }
    });
  }


  setLocalStorage(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  wrongPassword() {
    let wrongPassword = document.getElementById('wrong');
    wrongPassword.innerHTML = 'E-Mail oder Passwort ungültig'
  }

  checkIfalreadyUser(googleUser) {
    this.users$ = collectionData(this.usersCollection, { idField: 'id' });
    this.users$.subscribe(users => {
      const userWithEmail = users.find(user => user.email === googleUser.email);
      if (!userWithEmail) {
        console.log('user not found')
        this.addUserToFirebaseFromGoogleAccount(googleUser)
      }
    });
  }

  loginWithGoogle() {
    const auth = getAuth();
    auth.languageCode = 'de';
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        this.checkIfalreadyUser(result.user)
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

  async addUserToFirebaseFromGoogleAccount(user) {
    try {
      this.user.name = user.displayName;
      this.user.email = user.email;
      console.log(this.user)
      const docRef = await addDoc(this.usersCollection, this.user);

      console.log(`Benutzer wurde erfolgreich zu Firestore hinzugefügt mit ID: ${docRef.id}`);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Benutzers zu Firestore:', error);
    }
  }


  getUsers() {
    this.users$ = collectionData(this.usersCollection, { idField: 'id' })
  }
}
