import { Component, OnInit, ElementRef, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent implements OnInit {
  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  users: any[] = [];
  chats$ !: Observable<any>;


  message: string;
  selectedRecipient: string;
  relevantChats = [];
  chats: any;
  recipient = localStorage.getItem('selected-recipient')

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    const messageContent = this.el.nativeElement.querySelector('.message-content') as HTMLElement;
    if (messageContent) {
      setTimeout(() => {
        messageContent.scrollTop = messageContent.scrollHeight - messageContent.clientHeight;
      }, 100);
    }
  }

  postChat() {
    this.chatService.postChat(this.message, this.loggedUser.name, this.selectedRecipient);
    console.log('posted');
    console.log(this.message, this.loggedUser.name, this.selectedRecipient)
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
}

