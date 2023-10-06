import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { getAuth, signOut } from "firebase/auth";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  popup: boolean = false;

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
  }

  closePopup() {
    this.popup = false;
  }

  logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      localStorage.removeItem('userData');
      localStorage.removeItem('selected-recipient');
      localStorage.removeItem('channel');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.log(error)
    });
  }
}
