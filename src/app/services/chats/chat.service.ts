import { Injectable } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatDate = new Date();
  timeStamp = Timestamp.fromDate(this.chatDate)

  private interlocutorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  chats: any = {
    sender: '',
    receiver: '',
    message: '',
    timeStamp: this.timeStamp.seconds
  }

  setInterlocutor(interlocutor: string) {
    this.interlocutorSubject.next(interlocutor);
  }

  getInterlocutor(): Observable<string> {
    return this.interlocutorSubject.asObservable();
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
