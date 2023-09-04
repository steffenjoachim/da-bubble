import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';

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

  constructor(public firebaseService: FirebaseService,
    private router: Router) { }

  avatarUrls: string[] = [
    './assets/img/avatarinteractionmobile.png',
    './assets/img/avatarinteractionmobile1.png',
    './assets/img/avatarinteractionmobile2.png',
    './assets/img/avatarinteractionmobile3.png',
    './assets/img/avatarinteractionmobile4.png',
    './assets/img/avatarinteractionmobile5.png',
  ]

  registirationComplete: boolean = false;
  close: boolean = true;
  chooseAvatar: boolean = false;
  email: string = '';
  password: string = '';

  users = {
    name: '',
    email: '',
    avatar: ''
  };

  backToUserInput() {
    this.chooseAvatar = false;
    this.close = true;
  }

  checkIfSuccess() {
    this.chooseAvatar = false;
    this.registirationComplete = true;
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }

  async addUser() {
    try {
      this.users.email = this.email;
      await this.firebaseService.addUser(this.email, this.password, this.users);
      await this.checkIfSuccess();
    } catch (error) {
      alert('Fehler beim Hinzufügen des Benutzers. Bitte versuche erneut');
    }
  }

  closeRegistration() {
    this.close = false;
    this.chooseAvatar = true;
  }

  selectedAvatar(img: string) {
    this.users.avatar = img
  }
}
