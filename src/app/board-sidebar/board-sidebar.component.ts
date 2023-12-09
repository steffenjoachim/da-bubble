import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { DocumentData, Firestore, Timestamp, addDoc, collection, collectionData, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map, take } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { DialogSelectMembersComponent } from '../dialog-select-members/dialog-select-members.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

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
  userReadLastMeassage$: Observable<any>;
  members: any;
  addChannelPopup: boolean = false;
  popupContainer: boolean = true;
  addMembers: boolean = false;
  checkIfUserHasRead: boolean;
  shwoWrongText: boolean = false;
  popupheadline: string;
  message: string;
  wrongText: string;
  selectedRecipient = localStorage.getItem('selected-recipient');
  channel;
  channelChatsMessageLength: number;
  channelMembers: any[] = [];
  allChannels: any;
  indexLastMessage: number;
  newMessage: number;
  indexLastChat: number;
  isSelectChecked: boolean;
  isAllChecked: boolean;
  channelState: boolean[] = [];
  newMessages: number[] = [];
  event: any;

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chats: ChatService,
    private channelChat: ChannelService,
    private channels: Firestore,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.channel = localStorage.getItem('channel')
    this.selectedRecipient = localStorage.getItem('selected-recipient')
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.getChannels();
    this.loadChannels();
  }

  ngAfterViewInit() {
    this.getChannels();
  }

  public onSidebarLinkClick(selectedData): void {

    this.showChannel(selectedData);
    this.sidebarLinkClicked.emit(selectedData);
  }

  public OnAnotherEvent(selectedData): void {
    this.showChat(selectedData);
    this.anotherEvent.emit();
  }

  checkNewMessages(){
    console.log(this.chatCollection)
    for (let i = 0; i < this.users.length; i++) {
      const user = this.allUsers[i].name;
      console.log('checking new messages for', user)
    }
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

  pushAllMembers() {
    for (let i = 0; i < this.allUsers.length; i++) {
      const element = this.allUsers[i];
      this.channelsData.members.push(element);
    }
  }

  selectMembersForChannel() {
    this.shwoWrongText = false;
    if (this.isAllChecked) {
      this.pushAllMembers();
      this.addChannelToFirebase();
    } else if (this.isSelectChecked) {
      this.addChannelToFirebase();
    }
    else {
      this.shwoWrongText = true;
      this.wrongText = 'Bitte ein Checkbox auswählen'
    }
  }

  addChannelToFirebase() {
    if (this.channelsData.members.length > 0) {
      addDoc(this.channelCollection, this.channelsData)
      this.shwoWrongText = false;
      this.addChannelPopup = false;
      this.popupContainer = false;
      this.addMembers = false;
      this.clearChannelsData();
      this.closeAddChannelPopup();
    }
    else {
      this.shwoWrongText = true;
      this.wrongText = 'Bitte mindestens einen Mitglied auswählen'
    }
    this.isSelectChecked = false;
    this.isAllChecked = false;
  }

  openAddChanelPopup() {
    this.addChannelPopup = true
    this.popupheadline = 'Channel erstellen'
  }

  closeAddChannelPopup() {
    this.addChannelPopup = false;
    this.popupContainer = true;
    this.addMembers = false;
    this.channelName = '';
    this.channelDescription = '';
  }

  closeChannelCreate(event: Event) {
    const isInsidePopup = (event.target as HTMLElement).closest('.popup-container');
    if (isInsidePopup) {
      return;
    }
    this.closeAddChannelPopup();
    event.stopPropagation();
  }

  async pushUserRead(userRead, channel) {
    const chatsRef = doc(this.firestore, 'channels', channel.id);
    const chatsSnapshot = await getDoc(chatsRef);

    if (chatsSnapshot.exists()) {
      const chatsData = chatsSnapshot.data();
      const updatedChats = chatsData['chats'].map(chat => {
        const notifications = chat.notification || [];
        const userAlreadyExists = notifications.some(notification => notification.name === userRead.name);
        if (!userAlreadyExists) {
          notifications.push(userRead);
        }
        return { ...chat, notification: notifications };
      });
      await updateDoc(chatsRef, {
        chats: updatedChats
      });
    }
  }


  loadChannels() {
    this.channel$ = collectionData(this.channelCollection);
    this.channel$.subscribe((channels: any[]) => {
      channels.forEach((channel, index) => {
        this.messageBeenRead(index);
      });
    });
  }

  messageBeenRead(index) {
    collectionData(this.channelCollection).pipe(
      map(channel => {
        const lastChatIndex = channel[index]['chats'].length - 1;
        const lastChat = channel[index]['chats'][lastChatIndex];
        if (lastChat && lastChat.notification && Array.isArray(lastChat.notification)) {
          const userInLastMessage = lastChat.notification.some(notification => notification.name === this.loggedUser.name);
          if (!userInLastMessage) {
            const unreadMessagesCount = channel[index]['chats']
              .reduce((count, chat) => count + (chat.notification && Array.isArray(chat.notification) ? chat.notification.every(notification => notification.name !== this.loggedUser.name) : 0), 0);
            return unreadMessagesCount;
          }
        }
        return 0;
      })
    ).subscribe(unreadMessagesCount => {
      this.channelState[index] = unreadMessagesCount;
    });
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
      this.checkNewMessages();
    });
  }


  getChannels() {
    this.channel$ = collectionData(this.channelCollection, { idField: 'id' });
    this.channel$.subscribe((channels => {
      this.allChannels = channels;
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

  openDialogSelectMembers() {
    this.isAllChecked = false;
    const dialogConfig = {
      data: this.channelsData
    };
    const dialogRef = this.dialog.open(DialogSelectMembersComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
