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
import { ChangeDetectorRef } from '@angular/core';


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
  message: string;
  relevantAnswers: Observable<any>;
  chatAnswersSubject = new Subject<any[]>();
  answers$: Observable<any>;
  ChatService: any;
  channel: string;
  question: any
  threadOpened: boolean = false;
  chatQuestion: string;
  chatAvatar: string;
  chatSender: string;
  chatTimeStamp: number;

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private channelChat: Firestore,
    public channelService: ChannelService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  getAnswers(index) {
    console.log(index)
    this.chatQuestion = index.message;
    this.chatAvatar = index.avatar;
    this.chatSender = index.sender;
    this.chatTimeStamp = index.timeStamp;
    console.log(this.chatQuestion, this.chatAvatar, this.chatSender);
    this.threadOpened = true;
    this.cdr.detectChanges();
  }

    // // this.question = channel
    // this.answers$ = collectionData(this.channelChatCollection, { idField: 'id' });
    // this.answers$ = this.answers$.pipe(
    //   // map((chats) => chats.filter(chatItem => chatItem.id === channel.id))
    // );
    // this.answers$.subscribe(filteredData => {
    // });
  // }


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
    console.log(this.message);
    const userDataString = localStorage.getItem('userData');
    const loggedUser = JSON.parse(userDataString);
    console.log(this.answers$)
    this.channelService.postAnswer(this.question, loggedUser, this.message)
  }

  openDialogShowEmojis() {
    console.log('clicked');
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(DialogShowEmojisComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
