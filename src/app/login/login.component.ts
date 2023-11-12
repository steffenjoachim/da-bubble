import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('emailField') emailField!: ElementRef
  @ViewChild('passwordField') passwordField!: ElementRef
  @ViewChild('button') button!: ElementRef

  constructor(public firebaseService: FirebaseService,
    private router: Router) { }

  wrongPassword: boolean = false;
  loginData = {
    email: '',
    password: '',
  };
  passwordVisible = false;
  icon = true;
  show = './assets/img/visibility.png'
  hide = './assets/img/visibility_off.png'

  logIn() {
    this.firebaseService.loginUser(this.loginData.email, this.loginData.password)
  }

  loginGoogle() {
    this.firebaseService.loginWithGoogle();
  }

  guestLogin() {
    const guest: any = {
      name: 'Gast',
      avatar: './assets/img/Profile.png'
    }
    localStorage.removeItem('userData');
    localStorage.setItem('userData', JSON.stringify(guest))
    this.router.navigate(['/board']);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    console.log(this.passwordVisible)
    this.icon = !this.icon;
    console.log('icon', this.icon)
  }

}
