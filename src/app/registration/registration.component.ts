import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  @ViewChild('myForm') myForm!: ElementRef;
  @ViewChild('emailField') emailField!: ElementRef;
  @ViewChild('passwordField') passwordField!: ElementRef;
  @ViewChild('passwordField2') passwordField2!: ElementRef;

  constructor(public firebaseService: FirebaseService) { }

  users = {
    email: '',
    password: ''
  };

  addUser() {
    const emailInputElement = this.emailField.nativeElement;
    const passwordInputElement = this.passwordField.nativeElement;
    const password2InputElement = this.passwordField2.nativeElement;

    emailInputElement.disabled = true;
    passwordInputElement.disabled = true;
    password2InputElement.disabled = true;

    this.users.email = emailInputElement.value;
    this.users.password = passwordInputElement.value;
    this.firebaseService.addUser(this.users);
  }
}
