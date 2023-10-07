import { Injectable, ElementRef, ViewChild } from '@angular/core';
import { Firestore, Timestamp, collectionData, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { addDoc, collection } from '@firebase/firestore';
import { Observable, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  constructor(private channelChat: Firestore) {
  };

  uniqueId = uuidv4();
  chatCollection: any = collection(this.channelChat, 'channelChats');
  channelsCollection: any = collection(this.channelChat, 'channels');
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
    id: '',
    answers: []
  };

  getChatData(): Observable<any> {
    return this.chatData$;
  }

  postChat(message: any, selectedChannel) {
    let id = this.generateUniqueId(20); // Hier wird die eindeutige ID generiert
    const chatDate = new Date();
    const timeStamp = Timestamp.fromDate(chatDate)
    this.channelMessage.timeStamp = timeStamp.seconds;
    let loggedUser = JSON.parse(localStorage.getItem('userData'));
    this.channelMessage.avatar = loggedUser.avatar
    this.channelMessage.sender = loggedUser.name;
    this.channelMessage.message = message;
    this.channelMessage.channel = selectedChannel.name;
    this.channelMessage.id = id;
    const firebaseFieldName = 'chats'
    const postChat = this.channelMessage;
    this.updateDocOnFirebaseChannelChat(postChat, firebaseFieldName, selectedChannel);
  }


  // postChat(message: any, selectedChannel) {
  //   const chatDate = new Date();
  //   const timeStamp = Timestamp.fromDate(chatDate)
  //   this.channelMessage.timeStamp = timeStamp.seconds;
  //   let loggedUser = JSON.parse(localStorage.getItem('userData'));
  //   this.channelMessage.avatar = loggedUser.avatar
  //   this.channelMessage.sender = loggedUser.name;
  //   this.channelMessage.message = message;
  //   this.channelMessage.channel = selectedChannel.name;
  //   const firebaseFieldName = 'chats'
  //   const postChat = this.channelMessage
  //   this.updateDocOnFirebase(postChat, firebaseFieldName);
  //   // addDoc(this.chatCollection, this.channelMessage);
  // }

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

  postAnswer(selectedChannelMessage, sender, message, selectedChannel) {
    let id = this.generateUniqueId(20);
    const answersArray = selectedChannelMessage.answers
    const chatDate = new Date();
    const timeStamp = Timestamp.fromDate(chatDate);
    const firebaseFieldName = 'answers'
    const newAnswer = {
      sender: sender.name,
      message: message,
      timeStamp: timeStamp.seconds,
      avatar: sender.avatar,
      id: id
    };
    this.updateDocOnFirebaseChannelAnswers(newAnswer, firebaseFieldName, selectedChannel, selectedChannelMessage)
  }

  generateUniqueId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters.charAt(randomIndex);
    }
    return uniqueId;
  }

  async updateDocOnFirebaseChannelChat(newPost, firebaseFieldName, selectedChannel) {
    const documentReference = doc(this.channelChat, 'channels', selectedChannel.id);
    const docSnapshot = await getDoc(documentReference);
    if (docSnapshot.exists()) {
      const currentData = docSnapshot.data();
      if (currentData && Array.isArray(currentData['chats'])) {
        const currentChats = currentData['chats'];
        try {
          const updatedChats = [...currentChats, newPost];
          const updateData = {
            [firebaseFieldName]: updatedChats,
          };
          await updateDoc(documentReference, updateData);
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Daten in Firebase:', error);
        }
      } else {
        console.error('Das Feld "chats" ist in den Daten nicht vorhanden oder kein Array.');
        console.log(currentData['chats'])
      }
    } else {
      console.error('Das Dokument existiert in Firebase nicht.');
    }
  }


  async updateDocOnFirebaseChannelAnswers(postChat, firebaseFieldName, selectedChannel, selectedChannelMessage) {
    const documentReference = doc(this.channelChat, 'channels', selectedChannel.id);
    return getDoc(documentReference)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const currentData = docSnapshot.data();
          const updatedChats = currentData['chats'].map((chat) => {
            if (chat.id === selectedChannelMessage.id) {
              const updatedAnswers = [...chat.answers, postChat];
              return { ...chat, answers: updatedAnswers };
            } else {
              return chat;
            }
          });
          return updateDoc(documentReference, { chats: updatedChats });
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
