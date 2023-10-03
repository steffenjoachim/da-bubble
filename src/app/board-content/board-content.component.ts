import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
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

  channelChatCollection: any = collection(this.firestore, 'channelChats');
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
  selectedRecipient: string = '# Entwicklerteam';
  chats: any;
  answersAmount: number;
  keysToDelete = [];
  length: number;
  dialogRef: MatDialogRef<any>;
  groupedChats: any[] = []; 
  i: number = 0;

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private channelService: ChannelService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.setSelectedRecipient();
    this.getUsers();
    this.chatsChannel$.subscribe(chats => {
      // Gruppiere die Nachrichten nach Datum
      this.groupedChats = this.groupChatsByDate(chats);
    });
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

  isDifferentDate(currentChat: any, previousChat: any): boolean {
    if (!previousChat) {
      return true; 
    }

    const currentDate = new Date(currentChat.timeStamp * 1000);
    const previousDate = new Date(previousChat.timeStamp * 1000);
    return (
      currentDate.getFullYear() !== previousDate.getFullYear() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getDate() !== previousDate.getDate()
    );
  }

  isToday(timeStamp: number): boolean {
    const currentDate = new Date();
    const chatDate = new Date(timeStamp * 1000);
    return (
      currentDate.getFullYear() === chatDate.getFullYear() &&
      currentDate.getMonth() === chatDate.getMonth() &&
      currentDate.getDate() === chatDate.getDate()
    );
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
    this.getMembers()
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  }

  openThread(chat: any, index: number) {
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

  openDialogchannelInfo(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
    }
    const dialogRef = this.dialog.open(DialogChannelInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogChannelReaction(){
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.data = {
    // }
    // const dialogRef = this.dialog.open(DialogChannelReactionsComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe(result => {
    // });

  }

  closeDialogChannelReaction() {
      // this.dialogRef.close();
      console.log('left');
  }

  groupChatsByDate(chats: any[]): any[] {
    const grouped = [];
    let currentDate = null;

    chats.forEach(chat => {
      const chatDate = new Date(chat.timeStamp * 1000);

      if (!currentDate || !this.areDatesEqual(currentDate, chatDate)) {
        // Wenn das Datum unterschiedlich ist oder es das erste Datum ist, füge ein neues Gruppenelement hinzu
        grouped.push({
          date: chatDate,
          messages: [chat]
        });
        currentDate = chatDate;
      } else {
        // Füge die Nachricht dem aktuellen Gruppenelement hinzu
        grouped[grouped.length - 1].messages.push(chat);
      }
    });

    return grouped;
  }

  // Diese Funktion überprüft, ob zwei Datumswerte gleich sind (ohne Uhrzeit)
  areDatesEqual(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }  
  
}

