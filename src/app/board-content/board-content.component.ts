import { Component, OnInit, ElementRef, AfterViewInit, Input } from '@angular/core';
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
  ) { 
    
  }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.selectedRecipient = localStorage.getItem('selected-recipient')
  }

  ngAfterViewInit() {
    // Scrollen Sie nach dem Laden der Seite nach unten
    this.scrollToBottom();
  }

  scrollToBottom() {
    const messageContent = this.el.nativeElement.querySelector('.message-content') as HTMLElement;
    if (messageContent) {
      setTimeout(() => {
        messageContent.scrollTop = messageContent.scrollHeight - messageContent.clientHeight;
      }, 100); // Adjust the timeout value as needed
    }
  }
  
  postChat() {
    // this.showChat(this.selectedRecipient);
    this.chatService.postChat(this.message, this.loggedUser.name, this.selectedRecipient);
    console.log('posted');
    console.log(this.message,this.loggedUser.name, this.selectedRecipient)
    // this.scrollToBottom();
  }
  
  showChat(selectedRecipient: string) {
    throw new Error('Method not implemented.');
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
  }

  getChats(name) {
    
    this.relevantChats = [];
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$.subscribe((chats: any[]) => {
      for (let i = 0; i < chats.length; i++) {
        let element = chats[i];
        if ((this.loggedUser.name == element.sender && name == element.receiver) ||
          (this.loggedUser.name == element.receiver && name == element.sender)) {
          element.timeStamp = new Date(element.timeStamp);
          this.relevantChats.push(element);
        }
      }

      this.relevantChats.sort((a, b) => {
        return a.timeStamp - b.timeStamp;
      });

      this.renderChats();
    });
  }

  renderChats() {
    let content = document.getElementById('message-content');
    content.innerHTML = "";

    for (let i = 0; i < this.relevantChats.length; i++) {
      let element = this.relevantChats[i];
      if (this.loggedUser.name == element.sender) {
        content.innerHTML += this.returnStentMessageChat(element);
      } else {
        content.innerHTML += this.returnRecievedMessageChat(element);
      }
    }
  }

  returnStentMessageChat(element) {
    const unixTimestamp = element.timeStamp;
    const jsDate = new Date(unixTimestamp * 1000);
    const day = jsDate.getDate().toString().padStart(2, '0');
    const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
    const year = jsDate.getFullYear();
    const hour = jsDate.getHours();
    const minute = jsDate.getMinutes().toString().padStart(2, '0');
    return `
    <div class="sent-container">
    <div class="sent-name-avatar">
    <div><span>${this.loggedUser.name}</span>
      <div class="sent-message">
        <span class="date">${day}.${month}.${year}  ${hour}:${minute}</span>
        <span>${element.message}</span>
      </div>
      </div>
      <img class="avatar" src="${this.loggedUser.avatar}">
      </div>
      </div>
      </div>
    `;
  }


  returnRecievedMessageChat(element) {
    const unixTimestamp = element.timeStamp;
    const jsDate = new Date(unixTimestamp * 1000);
    const day = jsDate.getDate().toString().padStart(2, '0');
    const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
    const year = jsDate.getFullYear();
    const hour = jsDate.getHours().toString().padStart(2, '0');
    const minute = jsDate.getMinutes().toString().padStart(2, '0');
    return `<div class="recieved-container">
    <div class="recieved-message">
    <span class="date">${day}.${month}.${year}  ${hour}:${minute}</span>
    <span>${element.message}</span>
        </div>
        </div>
    `
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

