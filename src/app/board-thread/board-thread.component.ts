import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
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

  message: string;
  timestampMessage: number;
  avatarMessage: string;
  selectedRecipient: string;
  senderMessage: string;
  relevantAnswers = [];
  ChatService: any;


  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private channelChat: Firestore,
    private channelService: ChannelService
    ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getAnswers();
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  getAnswers() {
// Initialisiere den Index
let i = 0;
this.relevantAnswers = [];

while (true) {
  const key = `relevant-answer-${i}`;
  const chatJSON = localStorage.getItem(key);

  // Wenn kein Eintrag mehr mit dem aktuellen Schlüssel gefunden wird, beende die Schleife
  if (!chatJSON) {
    break;
  }

  const chat = JSON.parse(chatJSON);
  this.relevantAnswers.push(chat);
  i++; 
}
this.message = this.relevantAnswers[0].message;
this.avatarMessage = this.relevantAnswers[0].avatar;
this.senderMessage = this.relevantAnswers[0].sender;
console.log(this.relevantAnswers[0].message);
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

