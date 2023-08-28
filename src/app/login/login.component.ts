import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(public firebaseService: FirebaseService) { }

  loginData = {
    email: '',
    password: '',
  };

  logIn() {
    this.firebaseService.loginUser(this.loginData.email, this.loginData.password)
  }

  loginGoogle() {
    this.firebaseService.loginWithGoogle();
  }
}
