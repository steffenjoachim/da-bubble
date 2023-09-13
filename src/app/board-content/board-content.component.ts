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

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.setSelectedRecipient();
    this.getUsers();
  }

  setSelectedRecipient() {
    document.getElementById('selected-recipient').innerHTML = this.selectedRecipient = '# Entwicklerteam';
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = `Nachricht an # Entwicklerteam`
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
    const recipient = localStorage.getItem('selected-recipient');
    console.log(this.message, this.loggedUser.name, recipient)
    this.chatService.postChat(this.message, this.loggedUser.name, recipient);
    console.log('posted');
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

