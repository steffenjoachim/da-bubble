import { Component, OnInit } from '@angular/core';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { BoardComponent } from '../board/board.component';

@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent implements OnInit {

  private chatDataSubject = new BehaviorSubject<any[]>([]);
  chats$ = this.chatDataSubject.asObservable();

  chats: Observable<any[]>;
  constructor(private firbaseChannelChat: Firestore,
    private channelService: ChannelService,
    private parentBoard: BoardComponent) { }

  chatCollection: any = collection(this.firbaseChannelChat, 'channelChats');
  // chats$: Observable<any>
  relevantChats = [];
  loggedUser = JSON.parse(localStorage.getItem('userData'));
  chatDate = new Date();
  timeStamp = Timestamp.fromDate(this.chatDate);
  channel: any;


  ngOnInit(): void {
    this.getChats()
  }

  openDialogChannelAnswer() {
    console.log('test')
  }

  scrollToBottom() {
    document.getElementById('content-frame').scrollTop = document.getElementById('content-frame').scrollHeight;
  }

  public meineFunktion(): void {
    this.getChats()
    console.log('Funktion in ChannelChatComponent aufgerufen');
  }

  getChats() {
    this.channel = localStorage.getItem('channel')
    console.log(this.channel)
    this.relevantChats = [];
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$ = this.chats$.pipe(
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chats$.subscribe((chats) => {
      console.log(chats)
    });
  }
}

