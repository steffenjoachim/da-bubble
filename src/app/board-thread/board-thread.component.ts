import { Component, OnInit, ElementRef, AfterViewInit, Input, Inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { user } from '@angular/fire/auth';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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


  relevantAnswers: any;
  ChatService: any;
  channel: string;

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private channelChat: Firestore,
    public channelService: ChannelService,
    // @Inject(MAT_DIALOG_DATA) public chat: any
    ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
  }


  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  getAnswers(chat) {
    this.relevantAnswers = [chat]
  }


  closeThread() {
    document.getElementById('thread')?.classList.add('d-none');
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    const channel = localStorage.getItem('channel')
    this.channel =  channel
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }


postAnswer(){
console.log(this.relevantAnswers);
console.log(this.message);
const userDataString = localStorage.getItem('userData');
const loggedUser = JSON.parse(userDataString);
this.channelService.postAnswer(this.relevantAnswers, loggedUser, this.message)
}
}

