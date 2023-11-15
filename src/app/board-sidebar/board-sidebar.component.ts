import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { DocumentData, Firestore, Timestamp, addDoc, collection, collectionData, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { BoardComponent } from '../board/board.component';
import { BoardContentComponent } from '../board-content/board-content.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { getAuth, user } from '@angular/fire/auth';
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
  members: any;
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

  async pushUserRead(userRead, channel) {
    const indexLastMessage = channel.chats.length - 1;
    const chatsRef = doc(this.firestore, 'channels', channel.id);
    const chatsSnapshot = await getDoc(chatsRef);
    const chatsData = chatsSnapshot.data();

    // Annahme: chats ist ein Array von Objekten, und jedes Objekt hat ein Array notification
    const updatedChats = chatsData['chats'].map((chat, index) => {
        if (index === indexLastMessage) {
            const notifications = chat.notification || [];

            // Überprüfe, ob userRead.name bereits im Array vorhanden ist
            const userAlreadyExists = notifications.some(notification => notification.name === userRead.name);

            if (!userAlreadyExists) {
                notifications.push(userRead);
            }

            return { ...chat, notification: notifications };
        }
        return chat;
    });

    // Aktualisiere das Dokument in der Firestore-Datenbank
    await updateDoc(chatsRef, {
        chats: updatedChats
    });

    console.log('Chats array after update:', updatedChats);
}






  userHasRead(channel) {
    const chatDate = new Date();
    const timeStamp = Timestamp.fromDate(chatDate);
    const userRead = {
      name: this.loggedUser.name,
      timeStamp: timeStamp.seconds,
      isOnChannel: true
    }
    this.pushUserRead(userRead, channel);
  }

  showChannel(channel) {
    this.userHasRead(channel);
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
    this.channel$.subscribe((channels => {
      this.channels = channels;
    }));
  }

  isUserInChannel(channel: any): boolean {
    return channel.members.some(member => member.name === this.loggedUser.name);
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

}



