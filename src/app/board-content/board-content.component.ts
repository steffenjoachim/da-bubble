import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { DialogChannelAnswerComponent } from '../dialog-channel-answer/dialog-channel-answer.component'


@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent implements OnInit {

  @ViewChild('recieved') recievedElement: ElementRef;

  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  channelChatCollection: any = collection(this.firestore, 'channelChats');
  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  users: any[] = [];
  chatsChannel$ !: Observable<any>;
  channel;

  message: any = '';
  selectedRecipient: string = '# Entwicklerteam';
  relevantChats = [];
  chats: any;
  dialog: any;

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private channelService: ChannelService,
  ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.setSelectedRecipient();
    this.getUsers();
    this.getChats();
  }

  openDialogChannelAnswer() {
    console.log('test')
    // this.dialog.open(DialogChannelAnswerComponent);
  }

  setSelectedRecipient() {
    document.getElementById('selected-recipient').innerHTML = this.selectedRecipient;
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = `Nachricht an # Entwicklerteam`
  }

  postChat() {
    const channel = localStorage.getItem('channel')

    const recipient = localStorage.getItem('selected-recipient');
    console.log('channel: ', channel, ' recipient :', recipient )
    if (channel == recipient) {
      console.log('test')
      this.channelService.postChat(this.message, channel)
    } else {
      this.chatService.postChat(this.message, this.loggedUser, recipient);
    }
    this.message = '';
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }

  getChats() {
    this.relevantChats = [];
    this.channel = localStorage.getItem('channel')
    this.chatsChannel$ = collectionData(this.channelChatCollection, { idField: 'id' });
    this.chatsChannel$ = this.chatsChannel$.pipe(
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chatsChannel$.subscribe((chats) => {
      console.log(chats);
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  }
}

