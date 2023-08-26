import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private logoVisability = new BehaviorSubject<boolean>(false);
  logoVisible$ = this.logoVisability.asObservable();
  usersCollection: any = collection(this.firebase, 'users');

  constructor(public firebase: Firestore) { }

  users = {
    email: '',
    password: ''
  }

  setLogoVisible(visible: boolean):void{
    this.logoVisability.next(visible);
  }

  addUser(userData: any) {
    addDoc(this.usersCollection, userData)
  }
}

