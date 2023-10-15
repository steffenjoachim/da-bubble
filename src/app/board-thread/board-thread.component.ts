import { BoardContentComponent } from './../board-content/board-content.component';
import { Component, OnInit, ElementRef, AfterViewInit, Input, Inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, Timestamp, collection, collectionData, getDocs, where } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { BehaviorSubject, Observable, Subject, of, map } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { user } from '@angular/fire/auth';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { query } from '@angular/animations';
import { DialogShowEmojisComponent } from '../dialog-show-emojis/dialog-show-emojis.component';
import { SharedEmojiServiceService } from '../services/shared-emojis/shared-emoji.service.service';


@Component({
  selector: 'app-board-thread',
  templateUrl: './board-thread.component.html',
  styleUrls: ['./board-thread.component.scss']
})
export class BoardThreadComponent implements OnInit {
  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  public chatSubject = new BehaviorSubject<any>(null);
  chat$: Observable<any> = this.chatSubject.asObservable();

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  channelChatCollection: any = collection(this.channelChat, 'channels')
  users: any[] = [];
  chats$ !: Observable<any>;
  answerCollection$ !: Observable<any>;
  answers: any[] = [];
  message: string ='';
  relevantAnswers: Observable<any>;
  chatAnswersSubject = new Subject<any[]>();
  answers$: Observable<any>;
  ChatService: any;
  channel: string;
  selectedChannel: any;
  threadOpened: boolean = false;
  chatQuestion: string;
  chatAvatar: string;
  chatSender: string;
  chatTimeStamp: number;
  selectedChannelMessage: any;
  answersLength: number;
  emojisContainerVisible: boolean = false;
  emojis: string[] = [
    "❤️", "✅", "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", 
    "🙂", "🙃", "😉", "😌", "😍", "😘", "😗", "😙", "😚", "😋",
    "😛", "😜", "😝", "🤤", "😎", "🤩", "😏", "😒", "😞", "😔",
    "😖", "😢", "😭", "😓", "😪", "😥", "😰", "😩", "😫", "😤",
    "😠", "😡", "🤬", "🤯", "😳", "🥺", "😨", "😰", "😥", "😓",
    "🤗", "🙄", "😬", "😐", "😯", "😦", "😧", "😮", "😲", "🥴",
    "🤐", "🤫", "😵", "🥵", "🥶", "🥳", "🤓", "🧐", "😕",
    "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧",
    "😥", "😪", "😓", "😔", "😒", "😩", "😫",
    "😤", "😠",  "🤯", "🤢", "🤮", "🤧","😊", "😇",
  ];

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private channelChat: Firestore,
    public channelService: ChannelService,
    private dialog: MatDialog,
    private sharedEmojiServiceService: SharedEmojiServiceService) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
  }

  // ngAfterViewInit(): void {
  //     this.scrollToBottom();
  //   }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  getMessage(data) {
    const dataParse = JSON.parse(data);
    this.selectedChannel = dataParse.selectedChannel;
    this.selectedChannelMessage = dataParse.chat;
    this.chatQuestion = dataParse.chat.message;
    this.chatAvatar = dataParse.chat.avatar;
    this.chatSender = dataParse.chat.sender;
    this.chatTimeStamp = dataParse.chat.timeStamp;
    this.threadOpened = true;
    this.getMessageAnswers()
  }

  getMessageAnswers() {
    this.answerCollection$ = collectionData(this.channelChatCollection, { idField: 'id' });
    this.answerCollection$ = this.answerCollection$.pipe(
      map((channels: any) => {
        const selectedChannel = channels.find((channel: any) => channel.id === this.selectedChannel.id);
        if (selectedChannel) {
          const selectedMessage = selectedChannel.chats.find((chat: any) => chat.id === this.selectedChannelMessage.id);
          if (selectedMessage) {
            return selectedMessage.answers;
          }
        }
        return [];
      })
    )
    this.answerCollection$.subscribe((data: any) => {
      this.answersLength = data.length;
    });
    setTimeout(() => {
      this.scrollToBottom()
    }, 2000);
  }

  closeThread() {
    document.getElementById('thread')?.classList.add('d-none');
    this.threadOpened = false;
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    const channel = localStorage.getItem('channel')
    this.channel = channel
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }

  postAnswer() {
    const userDataString = localStorage.getItem('userData');
    const loggedUser = JSON.parse(userDataString);
    this.channelService.postAnswer(this.selectedChannelMessage, loggedUser, this.message, this.selectedChannel);
    this.message = '';
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame-thread').scrollHeight;
  }

  openDialogShowEmojis() {
    this.emojisContainerVisible = !this.emojisContainerVisible;
  }

  closeDialogEmoji(){
    this.emojisContainerVisible = false;
     }

  emojiSelected(emoji: string) {
    this.message += emoji;
    setTimeout(() => {
      this.emojisContainerVisible = true;
    }, 1);
  }

}
