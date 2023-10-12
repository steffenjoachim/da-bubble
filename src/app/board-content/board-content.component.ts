import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, collection, collectionData, Timestamp } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BoardThreadComponent } from '../board-thread/board-thread.component';
import { DialogChannelInfoComponent } from '../dialog-channel-info/dialog-channel-info.component';
import { DialogShowEmojisComponent } from '../dialog-show-emojis/dialog-show-emojis.component';
import { DialogChannelReactionsComponent } from '../dialog-channel-reactions/dialog-channel-reactions.component';


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

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  channelCollection: any = collection(this.firestore, 'channels')
  users: any[] = [];
  chatsChannel$ !: Observable<any>;
  chats$ !: Observable<any>;
  channelMembers$: Observable<any>;
  filteredChannelMembers$: Observable<any[]>;
  membersOfSelectedChannel$: Observable<any>;
  channel;//localStorage
  showChannelChat: boolean = false
  showChat: boolean = false;
  message: any = '';
  selectedRecipient: string;
  chats: any;
  answersAmount: number;
  length: number;
  dialogRef: MatDialogRef<any>;
  groupedChats: any[] = [];
  i: number = 0;
  lastDisplayedDate: Date | null = null;
  selectedChannel: any;
  prevChat: any;
  isHovered: boolean = false;
  private chatCount = 0;
  public selectedChannelChat: any = null;


  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private channelService: ChannelService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.getChannelChats();
    this.lastDisplayedDate = null;
    // this.chatsChannel$.subscribe(chats => {
    //   this.groupedChats = this.groupChatsByDate(chats);
    // });
  }

  getMembers() {
    this.channelMembers$ = collectionData(this.channelCollection, { idField: 'id' });
    this.filteredChannelMembers$ = this.channelMembers$.pipe(
      map(channels => channels.filter(channel => '# ' + channel.name == this.channel))
    );
    this.filteredChannelMembers$.subscribe(data => {
      this.length = data[0].members.length
    });
  }

  openDialogAddMembers() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogShowEmojis() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(DialogShowEmojisComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  isDifferentDate(chat, index): boolean {
    if (index === 0) {
      this.chatCount++;
      return true;
    }
    const chatDate = new Date(chat.chats[index].timeStamp * 1000);
    const prevChatDate = new Date(chat.chats[index - 1].timeStamp * 1000);
    const differentDate =
      chatDate.getFullYear() !== prevChatDate.getFullYear() ||
      chatDate.getMonth() !== prevChatDate.getMonth() ||
      chatDate.getDate() !== prevChatDate.getDate();
    return differentDate;
  }


  formatDate(timeStamp: number): string {
    const chatDate = new Date(timeStamp * 1000);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Setze Zeit auf Mitternacht
    const todayDate = new Date(currentDate);
    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(currentDate.getDate() - 1);
    if (chatDate >= todayDate) {
      return 'Heute';
    } else if (chatDate >= yesterdayDate) {
      return 'Gestern';
    } else {
      const day = chatDate.getDate();
      const monthNames = [
        'Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun',
        'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'
      ];
      const dayNames = [
        'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'
      ];
      const month = monthNames[chatDate.getMonth()];
      const dayName = dayNames[chatDate.getDay()];
      return `${dayName}, ${day} ${month}`;
    }
  }




  // groupChatsByDate(chats: any[]): any[] {
  //   const grouped = [];
  //   let currentDate = null;
  //   chats.forEach(chat => {
  //     chat.chats.forEach(element => {
  //       const chatDate = new Date(element.timeStamp * 1000);
  //       if (!currentDate || !this.areDatesEqual(currentDate, chatDate)) {
  //         grouped.push({
  //           date: chatDate,
  //           messages: [chat]
  //         });
  //         currentDate = chatDate;
  //       } else {
  //         grouped[grouped.length - 1].messages.push(chat);
  //       }
  //     });
  //   });
  //   return grouped;
  // }


  // areDatesEqual(date1: Date, date2: Date): boolean {
  //   return (
  //     date1.getFullYear() === date2.getFullYear() &&
  //     date1.getMonth() === date2.getMonth() &&
  //     date1.getDate() === date2.getDate()
  //   );
  // }

  setSelectedRecipient() {
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = 'Nachricht an ' + this.channel;
  }

  postChat() {
    const channel = localStorage.getItem('channel')
    const recipient = localStorage.getItem('selected-recipient');
    if (channel == recipient) {
      this.channelService.postChat(this.message, this.selectedChannel)
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

  showFunction(channel) {
    this.selectedChannel = channel
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
    document.getElementById('thread')?.classList.add('d-none');
    this.showChat = false;
    this.showChannelChat = true;
    this.channel = localStorage.getItem('channel');
    this.chatsChannel$ = collectionData(this.channelCollection, { idField: 'id' });

    this.chatsChannel$.subscribe((chats) => {
      if (this.channel) {
        this.selectChannel(chats, this.channel);
      } else if (chats.length > 0) {
        this.channel = '# ' + chats[0].name;
        this.selectChannel(chats, this.channel);
      }
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
      this.getMembers();
    });
    this.setSelectedRecipient();
  }

  selectChannel(chats, selectedChannel) {
    localStorage.setItem('channel', selectedChannel);
    this.selectedRecipient = selectedChannel;
    this.chatsChannel$ = this.chatsChannel$.pipe(
      map(chats => chats.filter(chat => '# ' + chat.name == selectedChannel)),
    );
    this.chatsChannel$.subscribe((chats) => {
      this.selectedChannel = chats[0];
    });
  }

  showChatIcons(channelChats: any) {
    this.selectedChannelChat = channelChats;
    this.isHovered = true;
  }

  hideChatIcons() {
    this.selectedChannelChat = null;
    this.isHovered = false;
  }


  scrollToBottom() {
    const contentFrame = document.getElementById('content-frame');
    if (contentFrame) {
      contentFrame.scrollTop = contentFrame.scrollHeight;
    }
  }

  openThread(chat: any) {
    console.log('opened')
    const data = {
      chat: chat,
      selectedChannel: this.selectedChannel
    }
    if (!this.selectedChannel) {
      data.selectedChannel = this.selectedChannel
    }
    this.contentClicked.emit(JSON.stringify(data));
    document.getElementById('thread')?.classList.remove('d-none');
    event.stopPropagation()
  }


  openDialogchannelInfo() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
    }
    const dialogRef = this.dialog.open(DialogChannelInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogChannelReaction() {
    console.log('opened');
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
    }
    const dialogRef = this.dialog.open(DialogChannelReactionsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  closeDialogChannelReaction() {
    this.dialogRef.close();
    console.log('closed');
  }

}

