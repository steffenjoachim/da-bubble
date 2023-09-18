import { Component, OnInit, ElementRef } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { DocumentData, Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';

@Component({
  selector: 'app-board-sidebar',
  templateUrl: './board-sidebar.component.html',
  styleUrls: ['./board-sidebar.component.scss']
})
export class BoardSidebarComponent implements OnInit {
  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  channelsData: any = {
    admin: '',
    members: [],
    name: '',
    description: ''
  }

  channelName: string;
  channelDescription: string;
  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  channelCollection: any = collection(this.channels, 'channels')
  users: any[] = [];
  channel$: Observable<any>;
  chats$ !: Observable<any>;
  addChannelPopup: boolean = false;
  popupContainer: boolean = true;
  addMembers: boolean = false;
  popupheadline: string;
  message: string;
  selectedRecipient = 'Entwicklerteam';
  channel;
  relevantChats = [];

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chats: ChatService,
    private channelChat: ChannelService,
    private channels: Firestore,
  ) {
    // this.channel = localStorage.getItem('channel')
  }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.scrollToBottom();
    this.getChannels();
    this.showChannel(this.selectedRecipient);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
    this.showChannel(name);
  }

  showChat(name) {
    this.selectedRecipient = name;
    if (this.loggedUser.name == 'Gast') {
      alert('Alls Gast kannst du leider keine Direktnachrichten senden');
    } else {
      this.chats.showChat(name);
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
    // 'document.getElementById('content-frame').classList.add('d-none');'
  }


  addChannel() {
    this.channelsData.name = this.channelName
    this.channelsData.admin = this.loggedUser.name
    this.channelsData.description = this.channelDescription
    this.chooseMember()
  }

  chooseMember() {
    this.popupContainer = false
    this.addMembers = true
    this.popupheadline = 'Leute hinzufügen'
  }

  addChannelToFirebase() {
    for (let i = 0; i < this.users.length; i++) {
      const element = this.users[i].name;
      this.channelsData.members.push(element)
      console.log(element)
    }
    addDoc(this.channelCollection, this.channelsData)
  }

  openAddChanelPopup() {
    this.addChannelPopup = true
    this.popupheadline = 'Channel erstellen'
  }

  closeAddChannelPopup() {
    this.addChannelPopup = false
    this.popupContainer = true
  }

  showChannel(channel) {
    if (channel !== 'Entwicklerteam') {
      this.selectedRecipient = channel['name'];
    } else {
      this.selectedRecipient = 'Entwicklerteam';
    }
    localStorage.setItem('channel', channel.name)
    this.channelChat.showChannelChat(channel)
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
  }

  getChannels() {
    this.channel$ = collectionData(this.channelCollection, { idField: 'id' });
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

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }
}



