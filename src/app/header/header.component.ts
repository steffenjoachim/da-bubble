import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Auth } from '@angular/fire/auth';
import { getAuth, signOut } from "firebase/auth";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  popup: boolean = false;

  loggedUser: any = {
    avatar: '',
    name: ''
  }

  constructor(
    private firebase: FirebaseService,
    private afAuth: Auth,
    private router: Router) { }

  ngOnInit() {
    this.loadLoggedUserData();
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }

  openPopup() {
    this.popup = true;
  }

  logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      localStorage.removeItem('userData');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.log(error)
    });
  }
}
