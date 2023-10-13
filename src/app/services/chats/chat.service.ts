import { Injectable } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatDate = new Date();
  timeStamp = Timestamp.fromDate(this.chatDate);

  private interlocutorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  chats: any = {
    sender: '',
    receiver: '',
    message: '',
    timeStamp: this.timeStamp.seconds,
    avatar: ''
  }

  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  selectedRecipient = '# Entwicklerteam';
  relevantChats: any[];
  chats$: Observable<import("@angular/fire/firestore").DocumentData[]>;

  chatCollection: any = collection(this.firebase, 'chats');
  constructor(private firebase: Firestore) {
    this.loggedUser = JSON.parse(localStorage.getItem('userData'))
  }

  postChat(message, sender, recipient) {
    this.chats.message = message;
    this.chats.sender = sender.name;
    this.chats.receiver = recipient;
    this.chats.avatar = sender.avatar
    addDoc(this.chatCollection, this.chats);
  }


  showChat(name) {
    this.selectedRecipient = name;
    localStorage.setItem('selected-recipient', this.selectedRecipient);
    this.getChats(name);
    this.showNameInBoardHead();
    this.showNameAsPlaceholderOfTextarea();
  }

  showNameInBoardHead() {
    document.getElementById('selected-recipient').innerHTML = `@ ` + this.selectedRecipient
  }

  showNameAsPlaceholderOfTextarea() {
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = `Nachricht an @ ` + localStorage.getItem('selected-recipient');
  }

  getChats(name) {
    this.relevantChats = [];
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$.subscribe((chats: any[]) => {
      this.relevantChats = [];
      for (let i = 0; i < chats.length; i++) {
        let element = chats[i];
        if ((this.loggedUser.name == element.sender && name == element.receiver) ||
          (this.loggedUser.name == element.receiver && name == element.sender)) {
          element.timeStamp = new Date(element.timeStamp);
          this.relevantChats.push(element);
        }
      }
      this.renderChats();
    });
  }


  renderChats() {
    this.relevantChats.sort((a, b) => {
      return a.timeStamp - b.timeStamp;
    });
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
    this.scrollToBottom();
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
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
    <div class="recieved-name-avatar">
    <div><span>${element.sender}</span>
    <div class="recieved-message">
    <span class="date">${day}.${month}.${year}  ${hour}:${minute}</span>
    <span>${element.message}</span>
        </div>
        </div>
        <img class="avatar" src="${element.avatar}">
        </div>
        </div>
    `
  }
}
