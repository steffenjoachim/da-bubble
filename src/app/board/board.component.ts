import { ChannelChatComponent } from './../channel-chat/channel-chat.component';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BoardSidebarComponent } from '../board-sidebar/board-sidebar.component';
import { BoardContentComponent } from '../board-content/board-content.component';
import { BoardThreadComponent } from '../board-thread/board-thread.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @ViewChild(ChannelChatComponent) public channelChatComponent: ChannelChatComponent;

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private channelChat: Firestore) { }


  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  channelChatCollection: any = collection(this.channelChat, 'channelChats');
  channelChats$: Observable<any>
  chatDate = new Date();
  timeStamp = Timestamp.fromDate(this.chatDate);
  channel: any;
  showChannelChat = false;
  chat: any

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  users: any[] = [];
  chats$ !: Observable<any>;

  @Input() interlocutor: string = '# Entwicklerteam';

  message: string;
  selectedRecipient: string;
  ChatService: any;

  functionInParent(channel) {
    console.log('Function in parent (board) component called', channel.name);
  }

  public callFunctionInChannelChat(): void {
    if (this.channelChatComponent) {
      this.showChannelChat = true;
      this.channelChatComponent.meineFunktion();
    }
  }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
  }

  onContentClicked(chat) {
    this.chat = chat
    console.log(chat)
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  closeSideBar() {
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

  openChannels() {
    document.getElementById('channels-body').classList.remove('d-none');
    document.getElementById('arrow-drop-down').classList.remove('d-none');
    document.getElementById('arrow-right').classList.add('d-none');
  }

  closeChannels() {
    document.getElementById('channels-body').classList.add('d-none');
    document.getElementById('arrow-drop-down').classList.add('d-none');
    document.getElementById('arrow-right').classList.remove('d-none');
  }

  closeDirectMessages() {
    document.getElementById('direct-messages-body').classList.add('d-none');
    document.getElementById('arrow-drop-down2').classList.add('d-none');
    document.getElementById('arrow-right2').classList.remove('d-none');
  }

  openDirectMessages() {
    document.getElementById('direct-messages-body').classList.remove('d-none');
    document.getElementById('arrow-drop-down2').classList.remove('d-none');
    document.getElementById('arrow-right2').classList.add('d-none');
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
