import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';



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
  chats$ !: Observable<any>;
  channel;
  chat;
  showChannelChat: boolean = false
  showChat: boolean = false;
  message: any = '';
  selectedRecipient: string = '# Entwicklerteam';
  relevantChats = [];
  chats: any;

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
  }

  openDialogChannelAnswer() {
    console.log('test')
  }

  setSelectedRecipient() {
    document.getElementById('selected-recipient').innerHTML = this.selectedRecipient;
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = `Nachricht an # Entwicklerteam`
  }

  postChat() {
    const channel = localStorage.getItem('channel')
    const recipient = localStorage.getItem('selected-recipient');
    if (channel == recipient) {
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

  startChat() {
    this.getChats()
  }

  showFunction() {
    this.getChanelChats()
  }

  getChats() {
    this.showChannelChat = false;
    this.showChat = true
    this.chat = localStorage.getItem('selected-recipient')
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$ = this.chats$.pipe(
      map(chats => chats.filter(chat => (chat.sender == this.loggedUser.name && chat.receiver == this.chat) || (chat.receiver == '@ ' + this.loggedUser.name && '@ ' + chat.sender == this.chat))),
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chats$.subscribe((chats) => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 200);
    });
  }

  getChanelChats() {
    this.showChat = false
    this.showChannelChat = true
    this.channel = localStorage.getItem('channel')
    this.chatsChannel$ = collectionData(this.channelChatCollection, { idField: 'id' });
    this.chatsChannel$ = this.chatsChannel$.pipe(
      map(chats => chats.filter(chat => chat.channel == this.channel)),
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chatsChannel$.subscribe((chats) => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 200);
    });
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  }
}

