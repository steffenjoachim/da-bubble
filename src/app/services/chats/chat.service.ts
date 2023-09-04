import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatDate = new Date().toString().slice(4, 21)

  chats: any = {
    sender: '',
    receiver: '',
    message: '',
    timeStamp: this.chatDate
  }

  chatCollection: any = collection(this.firebase, 'chats');
  constructor(private firebase: Firestore) { }

  postChat(message, sender, recipient) {
    this.chats.message = message;
    this.chats.sender = sender;
    this.chats.receiver = recipient;
    console.log(recipient);
    addDoc(this.chatCollection, this.chats);
  }
}
