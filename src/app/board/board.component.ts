import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, Timestamp, collection, collectionData } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  users: any[] = [];
  chats$ !: Observable<any>;

  interlocutor = '# Entwicklerteam'

  message: string;
  selectedRecipient: string;
  relevantChats = [];


  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chats: ChatService) { }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.getChats(name);
  }

  postChat() {
    this.showChat(this.selectedRecipient);
    this.chats.postChat(this.message, this.loggedUser.name, this.selectedRecipient);
  }

  showChat(name) {
    this.selectedRecipient = name;
    this.interlocutor = '@ ' + name;
    this.getChats(name);
  }

  showChannel() {
    this.interlocutor = '# Entwicklerteam';
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
  }

  getChats(name) {
    this.relevantChats = [];
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$.subscribe((chats: any[]) => {
      for (let i = 0; i < chats.length; i++) {
        let element = chats[i];
        if ((this.loggedUser.name == element.sender && name == element.receiver) ||
          (this.loggedUser.name == element.receiver && name == element.sender)) {
          // Konvertiere den Zeitstempel in ein JavaScript-Datumsobjekt
          element.timeStamp = new Date(element.timeStamp);
          this.relevantChats.push(element);
        }
      }

      // Sortiere relevantChats nach dem Timestamp
      // Sortiere relevantChats nach dem Zeitstempel
      this.relevantChats.sort((a, b) => {
        return a.timeStamp - b.timeStamp;
      });

      console.log(this.relevantChats);

      // Jetzt kannst du die sortierten Chats rendern
      this.renderChats();
    });
  }


  renderChats() {
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
  }



  returnStentMessageChat(element) {
    const unixTimestamp = element.timeStamp;
    const jsDate = new Date(unixTimestamp * 1000); const day = jsDate.getDate();
    const month = jsDate.getMonth() + 1;
    const year = jsDate.getFullYear();
    const hour = jsDate.getHours();
    const minute = jsDate.getMinutes();
    const second = jsDate.getSeconds();
    return `
      <div class="sent-message">
        <span>${day}.${month}.${year}  ${hour}.${minute}.${second}</span>
      </div>
    `;
  }


  returnRecievedMessageChat(element) {
    const unixTimestamp = element.timeStamp;
    const jsDate = new Date(unixTimestamp * 1000); const day = jsDate.getDate();
    const month = jsDate.getMonth() + 1;
    const year = jsDate.getFullYear();
    const hour = jsDate.getHours();
    const minute = jsDate.getMinutes();
    const second = jsDate.getSeconds();
    return `
    <div class="recieved-message">
    <span>${day}.${month}.${year}  ${hour}.${minute}.${second}</span>
        </div>
    `
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  closeSideBar() {
    if (this.open) {
      document.getElementById('side-bar')?.classList.add('d-none');
      document.getElementById('close-x')?.classList.add('d-none');
      document.getElementById('open-arrow')?.classList.remove('d-none');
      document.getElementById('close-workspace')?.classList.add('d-none');
      document.getElementById('open-workspace')?.classList.remove('d-none');
      this.open = false;
    } else {
      document.getElementById('side-bar')?.classList.remove('d-none');
      document.getElementById('close-x')?.classList.remove('d-none');
      document.getElementById('open-arrow')?.classList.add('d-none');
      document.getElementById('close-workspace')?.classList.remove('d-none');
      document.getElementById('open-workspace')?.classList.add('d-none');
      this.open = true;
    }
  }

  openChannels() {
    document.getElementById('channels-body').classList.remove('d-none');
    document.getElementById('arrow-drop-down').classList.remove('d-none');
    document.getElementById('arrow-right').classList.add('d-none');
  }

  closeChannels() {
    document.getElementById('channels-body').classList.add('d-none');
    document.getElementById('arrow-drop-down').classList.add('d-none');
    document.getElementById('arrow-right').classList.remove('d-none');
  }

  closeDirectMessages() {
    document.getElementById('direct-messages-body').classList.add('d-none');
    document.getElementById('arrow-drop-down2').classList.add('d-none');
    document.getElementById('arrow-right2').classList.remove('d-none');
  }

  openDirectMessages() {
    document.getElementById('direct-messages-body').classList.remove('d-none');
    document.getElementById('arrow-drop-down2').classList.remove('d-none');
    document.getElementById('arrow-right2').classList.add('d-none');
  }

  closeThread() {
    document.getElementById('thread')?.classList.add('d-none');
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }

  setChat() {

  }

}
