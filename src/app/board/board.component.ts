import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }
  usersCollection: any = collection(this.firestore, 'users');
  users: any[] = [];

  constructor(
    public firestore: Firestore,
    private firebase:FirebaseService,
    private afAuth: Auth
  ){}

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });

    console.log(this.loggedUser);
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
    
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  closeSideBar(){
    if (this.open) {
      document.getElementById('side-bar')?.classList.add('d-none');
      document.getElementById('close-x')?.classList.add('d-none');
      document.getElementById('open-arrow')?.classList.remove('d-none');
      document.getElementById('close-workspace')?.classList.add('d-none');
      document.getElementById('open-workspace')?.classList.remove('d-none');
      this.open = false;
    } else {
      document.getElementById('side-bar')?.classList.remove('d-none');
      document.getElementById('close-x')?.classList.remove('d-none');
      document.getElementById('open-arrow')?.classList.add('d-none');
      document.getElementById('close-workspace')?.classList.remove('d-none');
      document.getElementById('open-workspace')?.classList.add('d-none');
      this.open = true;
    }
  }

  openChannels(){
    document.getElementById('channels-body').classList.remove('d-none');
    document.getElementById('arrow-drop-down').classList.remove('d-none');
    document.getElementById('arrow-right').classList.add('d-none');
  }

  closeChannels(){
    document.getElementById('channels-body').classList.add('d-none');
    document.getElementById('arrow-drop-down').classList.add('d-none');
    document.getElementById('arrow-right').classList.remove('d-none');
  }

  closeDirectMessages(){
    document.getElementById('direct-messages-body').classList.add('d-none');
    document.getElementById('arrow-drop-down2').classList.add('d-none');
    document.getElementById('arrow-right2').classList.remove('d-none');

  }

  openDirectMessages(){
    document.getElementById('direct-messages-body').classList.remove('d-none');
    document.getElementById('arrow-drop-down2').classList.remove('d-none');
    document.getElementById('arrow-right2').classList.add('d-none');
  }

  closeThread(){
    document.getElementById('thread')?.classList.add('d-none');
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }

}
