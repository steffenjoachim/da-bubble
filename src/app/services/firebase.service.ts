import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  usersCollection: any = collection(this.firebase, 'users');

  constructor(public firebase: Firestore) { }

  users = {
    email: '',
    password: ''
  }

  addUser(userData: any) {
    addDoc(this.usersCollection, userData)
  }
}

