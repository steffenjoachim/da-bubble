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
  channelChatCollection: any = collection(this.channelChat, 'channelChats')
  users: any[] = [];
  chats$ !: Observable<any>;
  answerCollection$ !: Observable<any>;
  answers: any[] = [];

  interlocutor = '# Entwicklerteam'

  message: string;
  selectedRecipient: string;
  relevantChats = [];
  ChatService: any;


  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private channelChat: Firestore) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getAnswers()
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  closeThread() {
    document.getElementById('thread')?.classList.add('d-none');
  }

  getAnswers() {
    this.answerCollection$ = collectionData(this.channelChatCollection, { idField: 'id' });
    this.answerCollection$.subscribe((chats) => {
      this.answers = []; // Array für Antworten initialisieren
      chats.forEach((element) => {
        if (element.answers) {
          element.answers.forEach((answer) => {
            console.log(answer);
            console.log(element.answers.length);
            console.log(element);
            this.answers.push(answer); // Antwort zum Array hinzufügen
          });
        }
      });
    });
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

