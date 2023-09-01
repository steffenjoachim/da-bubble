import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('emailField') emailField!: ElementRef
  @ViewChild('passwordField') passwordField!: ElementRef
  @ViewChild('button') button!: ElementRef

  constructor(public firebaseService: FirebaseService) { }

  wrongPassword:boolean = false;
  loginData = {
    email: '',
    password: '',
  };

  logIn() {
    // let emailField = this.emailField.nativeElement;
    // let passwordField = this.passwordField.nativeElement;
    // let buton = this.button.nativeElement;

    // emailField.disabled = true;
    // passwordField.disabled = true;
    // buton.disabled = true;
    this.firebaseService.loginUser(this.loginData.email, this.loginData.password)
  }

  loginGoogle() {
    this.firebaseService.loginWithGoogle();
  }
}
