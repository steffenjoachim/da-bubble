import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  avatar = '';
  name = '';

  constructor(
    private firebase: FirebaseService,
    private afAuth: Auth) { }

  ngOnInit() {
    const loggedInUser = this.firebase.getLoggedInUser();
    this.avatar = loggedInUser.avatar;
    this.name = loggedInUser.name
  }

}
