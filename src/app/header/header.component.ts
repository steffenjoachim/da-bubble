import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { getAuth, signOut } from "firebase/auth";
import { onAuthStateChanged } from '@angular/fire/auth';
import { set } from '@angular/fire/database';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  popup: boolean = false;
  showProfile: boolean = false;
  showLogoutPopup: boolean = false;

  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  constructor(
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
    this.showLogoutPopup = true;
  }

  closePopup() {
    this.showProfile = false;
    const profile = document.querySelector(".popup");
    profile.classList.add("closing");
    const popup = document.querySelector(".popup-frame");
    popup.classList.add("closing");
    setTimeout(() => {
      this.popup = false;
    }, 290);
    event.stopPropagation();
  }

  openProfile() {
    this.showProfile = true;
    event.stopPropagation();
  }

  closeProfile() {
    const popup = document.querySelector(".profile-container");
    popup.classList.add("closing");
    setTimeout(() => {
      this.showProfile = false;
    }, 290);
    event.stopPropagation();
  }

  logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          this.router.navigate(['login']);
          localStorage.removeItem('userData');
          localStorage.removeItem('selected-recipient');
          localStorage.removeItem('channel');
        }
      });
    }).catch((error) => {
      console.log(error)
    });
  }
}
