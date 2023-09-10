import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable } from 'rxjs';
import { user } from '@angular/fire/auth';


@Component({
  selector: 'app-board-thread',
  templateUrl: './board-thread.component.html',
  styleUrls: ['./board-thread.component.scss']
})
export class BoardThreadComponent implements OnInit {
  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  users: any[] = [];
  chats$ !: Observable<any>;

  interlocutor = '# Entwicklerteam'

  message: string;
  selectedRecipient: string;
  relevantChats = [];
  ChatService: any;


  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chats: ChatService,
    private el: ElementRef
    ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  closeThread() {
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

