import { Injectable, ElementRef, ViewChild } from '@angular/core';
import { Firestore, Timestamp, collectionData } from '@angular/fire/firestore';
import { addDoc, collection } from '@firebase/firestore';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  constructor(private channelChat: Firestore) {
  };

  chatCollection: any = collection(this.channelChat, 'channelChats');
  chats$: Observable<any>
  relevantChats: any[];
  channels: any = {
    name: 'Entwicklerteam',
    admin: 'Sufyan',
    members: [
      'Bünyamin Ilhan',
      'Steffen Schanze'
    ]
  }

  chatDate = new Date();
  timeStamp = Timestamp.fromDate(this.chatDate)
  channelMessage: any = {
    message: '',
    timeStamp: this.timeStamp.seconds,
    channel: '',
    sender: '',
    avatar: ''
  }

  postChat(message: any, selectedChannel) {
    let loggedUser = JSON.parse(localStorage.getItem('userData'));
    this.channelMessage.avatar = loggedUser.avatar
    this.channelMessage.sender = loggedUser.name;
    this.channelMessage.message = message;
    this.channelMessage.channel = selectedChannel;
    addDoc(this.chatCollection, this.channelMessage);
  }

  showChannelChat(channel) {
    this.getChats(channel)
    this.showNameInBoardHead(channel);
    this.showNameAsPlaceholderOfTextarea(channel);
  }

  showNameInBoardHead(channel) {
    document.getElementById('selected-recipient').innerHTML = `# ` + channel.name
  }

  showNameAsPlaceholderOfTextarea(channel) {
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = `Nachricht an @ ` + channel.name;
  }

  getChats(selectedChannel) {
    this.relevantChats = [];
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$.subscribe((chats: any[]) => {
      this.relevantChats = [];
      for (let i = 0; i < chats.length; i++) {
        const element = chats[i];
        this.relevantChats.push(element)
      }
      this.renderChats();
    });
  }

  renderChats() {
    let loggedUser = JSON.parse(localStorage.getItem('userData'));
    this.relevantChats.sort((a, b) => {
      return a.timeStamp - b.timeStamp;
    });
    let content = document.getElementById('message-content');
    content.innerHTML = "";

    for (let i = 0; i < this.relevantChats.length; i++) {
      let element = this.relevantChats[i];
      if (loggedUser.name == element.sender) {
        content.innerHTML += this.returnStentMessageChat(element, loggedUser);
      } else {
        content.innerHTML += this.returnRecievedMessageChat(element, i);
      }
    }
    this.scrollToBottom();
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  }

  openDialogChannelAnswer() {
    console.log('test222')
  }

  returnStentMessageChat(element, loggedUser) {
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
    <div><span>${element.sender}</span>
      <div class="sent-message">
        <span class="date">${day}.${month}.${year}  ${hour}:${minute}</span>
        <span>${element.message}</span>
        <span class="answer" onclick="openDialogChannelAnswer()">Gib <span class="element-sender">${element.sender} </span> eine Antwort</span>
      </div>
      </div>
      <img class="avatar" src="${loggedUser.avatar}">
      </div>
      </div>
      </div>
    `;
  }

  returnRecievedMessageChat(element, i) {
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
    <span id="recieved" class="answer">Gib <span class="element-sender">${element.sender} </span> eine Antwort</span>
        </div>
        </div>
        <img class="avatar" src="${element.avatar}">
        </div>
        </div>
    `
  }
}
