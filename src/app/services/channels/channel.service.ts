import { Injectable, ElementRef, ViewChild } from '@angular/core';
import { Firestore, Timestamp, collectionData, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
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
    answers: [],
    notification: []
  };

  getChatData(): Observable<any> {
    return this.chatData$;
  }

  async postChat(message: any, selectedChannel) {
    if (message.trim() !== '') {
      const loggedUser = JSON.parse(localStorage.getItem('userData'));
      const id = this.generateUniqueId(20);
      const chatDate = new Date();
      const timeStamp = Timestamp.fromDate(chatDate);
      const firebaseFieldName = 'chats';
      const postChat = this.channelMessage;
      const userRead = {
        name: loggedUser.name,
        timeStamp: timeStamp.seconds
      }
      this.channelMessage.timeStamp = timeStamp.seconds;
      this.channelMessage.avatar = loggedUser.avatar;
      this.channelMessage.sender = loggedUser.name;
      this.channelMessage.message = message;
      this.channelMessage.channel = selectedChannel.name;
      this.channelMessage.id = id;
      this.channelMessage.notification.push(userRead)
      await this.updateDocOnFirebaseChannelChat(postChat, firebaseFieldName, selectedChannel);
      this.channelMessage.notification.splice(0, 1)
    }
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
          return null
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Daten in Firebase:', error);
        }
      } else {
        console.error('Das Feld "chats" ist in den Daten nicht vorhanden oder kein Array.');
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

  async postChannelReaction(reaction, message, channelId) {
    const documentReference = doc(this.channelChat, 'channels', channelId);
    try {
      const docSnapshot = await getDoc(documentReference);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const updatedChats = data['chats'].map((chat) => {
          if (chat.id === message.id) {
            const updatedMessage = Array.isArray(chat.reactions) ? [...chat.reactions, reaction] : [reaction];
            return { ...chat, reactions: updatedMessage };
          } else {
            return chat;
          }
        });
        const reactions = data['reactions'] || [];
        reactions.push(reaction);
        await updateDoc(documentReference, { chats: updatedChats });
      } else {
        await setDoc(documentReference, { reactions: [reaction] });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

}
