import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { DocumentData, Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { BoardComponent } from '../board/board.component';
import { BoardContentComponent } from '../board-content/board-content.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { getAuth } from '@angular/fire/auth';
import { onAuthStateChanged } from '@firebase/auth';

@Component({
  selector: 'app-board-sidebar',
  templateUrl: './board-sidebar.component.html',
  styleUrls: ['./board-sidebar.component.scss']
})
export class BoardSidebarComponent implements OnInit {
  @Output() sidebarLinkClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() anotherEvent: EventEmitter<void> = new EventEmitter<void>();

  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  channelsData: any = {
    admin: '',
    members: [],
    name: '',
    description: '',
    chats: []
  }

  channelName: any;
  channelDescription: string;
  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  channelCollection: any = collection(this.channels, 'channels')
  users: any[] = [];
  allUsers: any[] = [];
  channel$: Observable<any>;
  chats$ !: Observable<any>;
  addChannelPopup: boolean = false;
  popupContainer: boolean = true;
  addMembers: boolean = false;
  popupheadline: string;
  message: string;
  selectedRecipient = localStorage.getItem('selected-recipient');
  channel;
  channelMembers: any[] = [];

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chats: ChatService,
    private channelChat: ChannelService,
    private channels: Firestore) {

  }


  ngOnInit(): void {
    this.channel = localStorage.getItem('channel')
    this.selectedRecipient = localStorage.getItem('selected-recipient')
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.getChannels();
  }

  ngAfterViewInit() {
    this.getChannels();
  }

  public onSidebarLinkClick(selectedData): void {
    this.showChannel(selectedData);
    this.sidebarLinkClicked.emit(selectedData);
  }

  public OnAnotherEvent(selectedData): void {
    this.showChat(selectedData)
    this.anotherEvent.emit();
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
    for (let i = 0; i < this.allUsers.length; i++) {
      const element = this.allUsers[i];
      console.log(element)
      this.channelsData.members.push(element);
    }

    addDoc(this.channelCollection, this.channelsData)
    this.addChannelPopup = false
    this.popupContainer = false
    this.addMembers = false
    this.clearChannelsData()
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
    localStorage.setItem('selected-recipient', '# ' + channel.name);
    localStorage.setItem('channel', '# ' + channel.name);

    this.selectedRecipient = '# ' + channel.name
    this.channelChat.showChannelChat(channel);
    document.getElementById('channel-members').classList.remove('d-none');
  }

  showChat(name) {
    this.selectedRecipient = name;
    if (this.loggedUser.name == 'Gast') {
      alert('Alls Gast kannst du leider keine Direktnachrichten senden');
    } else {
      localStorage.setItem('selected-recipient', '@ ' + name)
      this.channelChat.showChannelChat(name)
    }
    document.getElementById('channel-members').classList.add('d-none');
    document.getElementById('thread')?.classList.add('d-none');
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.allUsers = usersArray;
      this.users = usersArray.filter((user: any) => user.name !== this.loggedUser.name);
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

  clearChannelsData() {
    this.channelsData = {
      admin: '',
      members: [],
      name: '',
      description: ''
    }
  }

  onSidebarLinkClickAndOpenContent(channel) {
    this.onSidebarLinkClick(channel);
    this.openContent(channel);
  }

  openContent(channel){
    // document.getElementById('content-box').style.display = 'block';  }

}


}
