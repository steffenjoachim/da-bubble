import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
constructor(public firebaseService: FirebaseService) {
}

  users: any = {
    email: '',
    password: ''
  }

  addUser() {
    this.firebaseService.addUser(this.users);
    console.log('registered')
  }
}
