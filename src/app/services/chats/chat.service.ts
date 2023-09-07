import { Injectable } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatDate = new Date();
  timeStamp = Timestamp.fromDate(this.chatDate)



  chats: any = {
    sender: '',
    receiver: '',
    message: '',
    timeStamp: this.timeStamp.seconds
  }

  chatCollection: any = collection(this.firebase, 'chats');
  constructor(private firebase: Firestore) { }

  postChat(message, sender, recipient) {
    this.chats.message = message;
    this.chats.sender = sender;
    this.chats.receiver = recipient;
    addDoc(this.chatCollection, this.chats);
  }
}
