import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private logoVisibility = new BehaviorSubject<boolean>(false);
  logoVisible$ = this.logoVisibility.asObservable();
  usersCollection: any = collection(this.firebase, 'users');
  users$ !: Observable<any>;
  private loggedInUser: any;

  constructor(public firebase: Firestore,
    private router: Router) {
    this.getUers()
  }

  setLogoVisible(visible: boolean): void {
    this.logoVisibility.next(visible);
  }

  addUser(email: string, password: string, users: any) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
      })
    addDoc(this.usersCollection, users)
  }

  loginUser(email: string, password: string) {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        this.router.navigate(['/board']);
      })
      .catch((error) => {
        console.error(error)
      });
  }

  loginWithGoogle() {
    const auth = getAuth();
    auth.languageCode = 'de';
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

  }


  getUers() {
    this.users$ = collectionData(this.usersCollection, { idField: 'id' })
  }

  setLoggedInUser(user: any) {
    this.loggedInUser = user;
  }

  getLoggedInUser() {
    return this.loggedInUser;
  }
}
