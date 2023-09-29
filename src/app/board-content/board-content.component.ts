import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BoardThreadComponent } from '../board-thread/board-thread.component';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent implements OnInit {
  @Output() contentClicked = new EventEmitter<string>();
  @ViewChild('boardThread', { static: true }) boardThread: BoardThreadComponent;

  @Input() chat: any
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
  channelMembers$ !: Observable<any>;
  channelMembers: any[] = [];
  channel;
  showChannelChat: boolean = false
  showChat: boolean = false;
  message: any = '';
  selectedRecipient: string = '# Entwicklerteam';
  chats: any;
  answersAmount: number;
  keysToDelete = [];

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private channelService: ChannelService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.setSelectedRecipient();
    this.getUsers();
  }

  openDialogAddMembers(chat, i) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = chat;
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
    this.getChannelChats()
  }

  getChats() {
    this.showChannelChat = false;
    this.showChat = true;
    this.chat = localStorage.getItem('selected-recipient');
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

  getChannelChats() {
    this.showChat = false
    this.showChannelChat = true
    this.channel = localStorage.getItem('channel');
    this.chatsChannel$ = collectionData(this.channelChatCollection, { idField: 'id' });
    this.chatsChannel$ = this.chatsChannel$.pipe(
      map(chats => chats.filter(chat => chat.channel == this.channel)),
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chatsChannel$.subscribe((chats) => {
      chats.forEach(element => {
        this.answersAmount = element.answers.length;
      });
      setTimeout(() => {
        this.scrollToBottom()
      }, 200);
    });

    this.getChannesMembers(this.chatsChannel$);
  }

  getChannesMembers(channelMembers$) {
    this.channelMembers$ = channelMembers$
    console.log(this.channelMembers)
    // this.channelMembers$.subscribe(data => {
    //   this.channelMembers = data;
    // });
  }


  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  }

  openThread(chat, i) {
    this.contentClicked.emit(chat)
    document.getElementById('thread')?.classList.remove('d-none');
    this.selectRelevantAnswers(chat);
  }

  selectRelevantAnswers(chat) {
    for (const keyToDelete of this.keysToDelete) {
      localStorage.removeItem(keyToDelete);
    }
    for (let i = 0; i < chat.answers.length; i++) {
      const key = `relevant-answer-${i}`;
      this.keysToDelete.push(key);
      const answer = chat.answers[i];
      const chatJSON = JSON.stringify(chat);
      localStorage.setItem(key, chatJSON);
    }
  }

}
