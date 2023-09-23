import { Injectable, ElementRef, ViewChild } from '@angular/core';
import { Firestore, Timestamp, collectionData, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { addDoc, collection } from '@firebase/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  constructor(private channelChat: Firestore) {
  };

  chatCollection: any = collection(this.channelChat, 'channelChats');
  chats$: Observable<any>
  private chatData$: Observable<any>;
  relevantChats: any[];
  channels: any = {
    name: 'Entwicklerteam',
    admin: 'Sufyan',
    members: [
      'Bünyamin Ilhan',
      'Steffen Schanze'
    ]
  }

  channelMessage: any = {
    message: '',
    timeStamp: 0,
    channel: '',
    sender: '',
    avatar: '',
    answers: []
  };

  getChatData(): Observable<any> {
    return this.chatData$;
  }

  postChat(message: any, selectedChannel: string) {
    const chatDate = new Date();
    const timeStamp = Timestamp.fromDate(chatDate)
    this.channelMessage.timeStamp = timeStamp.seconds;
    let loggedUser = JSON.parse(localStorage.getItem('userData'));
    this.channelMessage.avatar = loggedUser.avatar
    this.channelMessage.sender = loggedUser.name;
    this.channelMessage.message = message;
    this.channelMessage.channel = selectedChannel;
    addDoc(this.chatCollection, this.channelMessage);
  }

  showChannelChat(channel) {
    this.showNameInBoardHead(channel);
    this.showNameAsPlaceholderOfTextarea(channel);
  }

  showNameInBoardHead(channel) {
    if (channel.name) {
      document.getElementById('selected-recipient').innerHTML = `# ` + channel.name;
    } else {
      document.getElementById('selected-recipient').innerHTML = `@ ` + channel;
    }
  }

  showNameAsPlaceholderOfTextarea(channel) {
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    if (channel.name) {
      chatField.placeholder = `Nachricht an # ` + channel.name;
    } else {
      chatField.placeholder = `Nachricht an @ ` + channel;
    }
  }

  postAnswer(chat, sender, message) {
    const chatDate = new Date();
    const timeStamp = Timestamp.fromDate(chatDate);
    const newAnswer = {
      sender: sender.name,
      message: message,
      timeStamp: timeStamp.seconds,
      avatar: sender.avatar
    };
    this.updateDocOnFirebase(chat, newAnswer)
  }

  updateDocOnFirebase(chat, newAnswer) {
    const documentReference = doc(this.channelChat, 'channelChats', chat.id);
    return getDoc(documentReference)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const currentData = docSnapshot.data();
          const updatedAnswers = [...currentData['answers'], newAnswer];
          return updateDoc(documentReference, { answers: updatedAnswers });
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Fehler beim Aktualisieren des Dokuments:', error);
        throw error;
      });
  }
}
