import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  @ViewChild('nameField') nameField!: ElementRef;
  @ViewChild('emailField') emailField!: ElementRef;
  @ViewChild('passwordField') passwordField!: ElementRef;

  constructor(public firebaseService: FirebaseService) { }


  avatarUrls: string[] = [
    './assets/img/avatarinteractionmobile.png',
    './assets/img/avatarinteractionmobile1.png',
    './assets/img/avatarinteractionmobile2.png',
    './assets/img/avatarinteractionmobile3.png',
    './assets/img/avatarinteractionmobile4.png',
    './assets/img/avatarinteractionmobile5.png',

  ]

  close: boolean = true;
  chooseAvatar: boolean =  false
  users = {
    name: '',
    email: '',
    password: '',
    avatar: ''
  };

  addUser() {
    const nameInputElement = this.nameField.nativeElement;
    const emailInputElement = this.emailField.nativeElement;
    const passwordInputElement = this.passwordField.nativeElement;

    nameInputElement.disabled = true;
    emailInputElement.disabled = true;
    passwordInputElement.disabled = true;

    this.users.email = emailInputElement.value;
    this.users.password = passwordInputElement.value;

  }

addUser2() {
  this.firebaseService.addUser(this.users);
}

  closeRegistration() {
    this.close = false;
    this.chooseAvatar = true;
  }

  selectedAvatar(img:string) {
this.users.avatar = img
    console.log(this.users)
  }
}
