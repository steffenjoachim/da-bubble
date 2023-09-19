import { Component, OnInit } from '@angular/core';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent implements OnInit {

  constructor(private firbaseChannelChat: Firestore) { }

  chatCollection: any = collection(this.firbaseChannelChat, 'channelChats');
  chats$: Observable<any>
  relevantChats = [];
  loggedUser = JSON.parse(localStorage.getItem('userData'));
  chatDate = new Date();
  timeStamp = Timestamp.fromDate(this.chatDate)
  isSent: boolean = false

  ngOnInit(): void {
    this.getChats()
  }

  openDialogChannelAnswer() {
    console.log('test')
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  }

  getChats() {
    this.relevantChats = [];
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$ = this.chats$.pipe(
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chats$.subscribe((chats) => {

    });
    this.scrollToBottom()
  }

}

