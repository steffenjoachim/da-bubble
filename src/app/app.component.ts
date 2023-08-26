import { Component } from '@angular/core';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor(public firebaseService: FirebaseService) {}

  title = 'da-bubble';

  users:any = {
    email: '',
    password: ''
  }

addUser() {
  this.firebaseService.addUser(this.users);
}

}
