import { user } from '@angular/fire/auth';
import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Firestore, collection, collectionData, Timestamp, deleteDoc, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { ChatService } from '../services/chats/chat.service';
import { Observable, map, BehaviorSubject, of, take, filter, mergeMap } from 'rxjs';
import { ChannelService } from '../services/channels/channel.service';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BoardThreadComponent } from '../board-thread/board-thread.component';
import { DialogChannelInfoComponent } from '../dialog-channel-info/dialog-channel-info.component';
import { DialogShowEmojisComponent } from '../dialog-show-emojis/dialog-show-emojis.component';
import { DialogChannelReactionsComponent } from '../dialog-channel-reactions/dialog-channel-reactions.component';


@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent implements OnInit {
  @Output() contentClicked = new EventEmitter<string>();
  @ViewChild('boardThread', { static: true }) boardThread: BoardThreadComponent;

  @Input() chat: any
  @ViewChild('recieved') recievedElement: ElementRef;

  open: boolean = true;
  loggedUser: any = {
    avatar: './assets/img/Profile.png',
    name: 'Gast'
  }

  reaction: any = {
    counter: 1,
    emoji: '',
    userReaction: [
      {
        sender: '',
        timeStamp: 0
      }
    ]
  }

  chatCollection: any = collection(this.firestore, 'chats');
  usersCollection: any = collection(this.firestore, 'users');
  channelCollection: any = collection(this.firestore, 'channels')
  users: any[] = [];
  chatsChannel$ !: Observable<any>;
  chats$ !: Observable<any>;
  channelMembers$: Observable<any>;
  filteredChannelMembers$: Observable<any[]>;
  membersOfSelectedChannel$: Observable<any>;
  emojis$: Observable<any>;
  channel;//localStorage
  showChannelChat: boolean = false
  showChat: boolean = false;
  emojisContainerVisible: boolean = false;
  emojisReactionContainerVisible: boolean = false;
  emojisChannelContainerVisible: boolean = false;
  isHovered: boolean = false;
  message: any = '';
  selectedRecipient: string;
  chats: any;
  answersAmount: number;
  length: number;
  i: number = 0;
  emojiCounter: number = 0;
  dialogRef: MatDialogRef<any>;
  groupedChats: any[] = [];
  directMessageDates: number[] = [];
  lastDisplayedDate: Date | null = null;
  selectedChannel: any;
  prevChat: any;
  private chatCount = 0;
  public selectedChannelChat: any = null;
  emojis: string[] = [
    "❤️", "✅", "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "🙂", "🙃", "😉", "😌", "😍", "😘", "😗", "😙", "😚", "😋",
    "😛", "😜", "😝", "🤤", "😎", "🤩", "😏", "😒", "😞", "😔",
    "😖", "😢", "😭", "😓", "😪", "😥", "😰", "😩", "😫", "😤",
    "😠", "😡", "🤬", "🤯", "😳", "🥺", "😨", "😰", "😥", "😓",
    "🤗", "🙄", "😬", "😐", "😯", "😦", "😧", "😮", "😲", "🥴",
    "🤐", "🤫", "😵", "🥵", "🥶", "🥳", "😎", "🤓", "🧐", "😕",
    "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧",
    "😨", "😰", "😥", "😪", "😓", "😔", "😞", "😒", "😩", "😫",
    "😤", "😠", "😡", "🤬", "🤯", "🤢", "🤮", "🤧", "😊", "😇",
  ];

  displayedEmojis: string[] = [];

  constructor(
    public firestore: Firestore,
    private firebase: FirebaseService,
    private chatService: ChatService,
    private channelService: ChannelService,
    private dialog: MatDialog) {
    this.loadMoreEmojis();
    this.directMessageDates = [];
  }

  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
    this.loadLoggedUserData();
    this.getUsers();
    this.getChannelChats();
    this.lastDisplayedDate = null;
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

  getMembers() {
    this.channelMembers$ = collectionData(this.channelCollection, { idField: 'id' });
    this.filteredChannelMembers$ = this.channelMembers$.pipe(
      map(channels => channels.filter(channel => '# ' + channel.name == this.channel))
    );
    this.filteredChannelMembers$.subscribe(data => {
      this.length = data[0].members.length
    });
  }

  openDialogAddMembers() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogShowEmojis() {
    this.emojisContainerVisible = !this.emojisContainerVisible;
  }

  closeDialogEmoji() {
    this.emojisContainerVisible = false;
  }

  emojiSelected(emoji: string) {
    this.message += emoji;
    setTimeout(() => {
      this.emojisContainerVisible = true;
    }, 1);
  }

  isDifferentDate(chat, index) {
    if (chat.receiver || chat.sender) {
      const timeStampInSeconds = chat.timeStamp;
      if (!this.directMessageDates.includes(timeStampInSeconds)) {
        this.directMessageDates.push(timeStampInSeconds);
      }
      if (index > 0) {
        return this.checkDateDirectChat(chat, index);
      } else if (index === 0) {
        this.chatCount++;
        return true;
      }
    }
    return this.checkDateChannelChat(chat, index);
  }

  checkDateDirectChat(chat, index) {
    const timeStampInSeconds = chat.timeStamp;
    if (!this.directMessageDates.includes(timeStampInSeconds)) {
      this.directMessageDates.push(timeStampInSeconds);
    }
    if (index > 0) {
      const chatDate = new Date(timeStampInSeconds * 1000);
      const prevTimeStampInSeconds = this.directMessageDates[index - 1];
      const prevChatDate = new Date(prevTimeStampInSeconds * 1000);
      const differentDate =
        chatDate.getFullYear() !== prevChatDate.getFullYear() ||
        chatDate.getMonth() !== prevChatDate.getMonth() ||
        chatDate.getDate() !== prevChatDate.getDate();
      return differentDate;
    }
    return false;
  }

  checkDateChannelChat(chat, index) {
    if (index == 0) {
      const chatDate = new Date(chat.chats[index].timeStamp * 1000);
      return chatDate;
    } else if (index > 0 && chat.chats && chat.chats[index] && chat.chats[index - 1]) {
      const chatDate = new Date(chat.chats[index].timeStamp * 1000);
      const prevChatDate = new Date(chat.chats[index - 1].timeStamp * 1000);
      const differentDate =
        chatDate.getFullYear() !== prevChatDate.getFullYear() ||
        chatDate.getMonth() !== prevChatDate.getMonth() ||
        chatDate.getDate() !== prevChatDate.getDate();
      return differentDate;
    }
    return false;
  }


  formatDate(timeStamp: number): string {
    const chatDate = new Date(timeStamp * 1000);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(currentDate);
    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(currentDate.getDate() - 1);
    if (chatDate >= todayDate) {
      return 'Heute';
    } else if (chatDate >= yesterdayDate) {
      return 'Gestern';
    } else {
      const day = chatDate.getDate();
      const monthNames = [
        'Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun',
        'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'
      ];
      const dayNames = [
        'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'
      ];
      const month = monthNames[chatDate.getMonth()];
      const dayName = dayNames[chatDate.getDay()];
      return `${dayName}, ${day} ${month}`;
    }
  }

  async deleteChat(selectedChat) {
    const channelId = this.selectedChannel.id;
    const chatToRemove = selectedChat;
    if (this.loggedUser.name === chatToRemove.sender) {
      const channelDocRef = doc(this.firestore, 'channels', channelId);
      const channelDocSnapshot = await getDoc(channelDocRef);
      if (channelDocSnapshot.exists()) {
        const chatsArray = channelDocSnapshot.data()['chats'];
        if (chatsArray) {
          const updatedChatsArray = chatsArray.filter(chat => chat.id !== chatToRemove.id);
          await setDoc(channelDocRef, { chats: updatedChatsArray }, { merge: true });
          this.chatsChannel$ = collectionData(this.channelCollection, { idField: 'id' });
        }
      }
      await deleteDoc(doc(this.chatCollection, selectedChat.id));
    }
    document.getElementById('thread')?.classList.add('d-none');
  }

  setSelectedRecipient() {
    const chatField = document.getElementById('textarea') as HTMLTextAreaElement;
    chatField.placeholder = 'Nachricht an ' + this.channel;
  }

  postChat() {
    const channel = localStorage.getItem('channel')
    const recipient = localStorage.getItem('selected-recipient');
    if (channel == recipient) {
      this.channelService.postChat(this.message, this.selectedChannel)
    } else {
      this.chatService.postChat(this.message, this.loggedUser, recipient);
    }
    this.message = '';
  }

  getUsers() {
    const usersObservable = collectionData(this.usersCollection, { idField: 'id' });
    usersObservable.subscribe((usersArray) => {
      this.users = usersArray;
    });
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

  loadLoggedUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser.avatar = userData.avatar;
      this.loggedUser.name = userData.name;
    }
  }

  startChat() {
    this.getChats()
  }

  showFunction(channel) {
    this.selectedChannel = channel
    this.getChannelChats()
  }

  getChats() {
    this.showChannelChat = false;
    this.showChat = true;
    this.chat = localStorage.getItem('selected-recipient');
    this.chats$ = collectionData(this.chatCollection, { idField: 'id' });
    this.chats$ = this.chats$.pipe(
      map(chats => chats.filter(chat => (chat.sender == this.loggedUser.name && chat.receiver == this.chat) || (chat.receiver == '@ ' + this.loggedUser.name && '@ ' + chat.sender == this.chat))),
      map(chats => chats.sort((a, b) => a.timeStamp - b.timeStamp))
    );
    this.chats$.subscribe((chats) => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 200);
    });
  }

  getChannelChats() {
    document.getElementById('thread')?.classList.add('d-none');
    this.showChat = false;
    this.showChannelChat = true;
    this.channel = localStorage.getItem('channel');
    this.chatsChannel$ = collectionData(this.channelCollection, { idField: 'id' });

    this.chatsChannel$.subscribe((chats) => {
      if (this.channel) {
        this.selectChannel(chats, this.channel);
      } else if (chats.length > 0) {
        this.channel = '# ' + chats[0].name;
        localStorage.setItem('selected-recipient', this.channel);
        this.setSelectedRecipient();
        this.selectChannel(chats, this.channel);
      }
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
      this.getMembers();
    });
    this.setSelectedRecipient();
  }

  selectChannel(chats, selectedChannel) {
    localStorage.setItem('channel', selectedChannel);
    this.selectedRecipient = selectedChannel;
    this.chatsChannel$ = this.chatsChannel$.pipe(
      map(chats => chats.filter(chat => '# ' + chat.name == selectedChannel)),
    );
    this.chatsChannel$.subscribe((chats) => {
      this.selectedChannel = chats[0];
    });
  }

  showChatIcons(i: number) {
    document.getElementById(`chat-icon-frame${i}`).style.visibility = 'visible';
  }

  hideChatIcons(i: number) {
    document.getElementById(`chat-icon-frame${i}`).style.visibility = 'hidden';
  }

  emojiSelectedReactionChat(emoji, chat) {
    const date = new Date();
    this.reaction.userReaction[0].timeStamp = date.getTime();
    this.reaction.emoji = emoji;
    this.reaction.userReaction[0].sender = this.loggedUser.name;
    this.chatService.postReaction(this.reaction, chat);
  }

  emojiLikeChat(emoji, messageToFind) {
    const selectedUserReaction = this.loggedUser.name;
    this.emojis$ = collectionData(this.chatCollection, { idField: 'id' });
    this.emojis$ = this.emojis$.pipe(
      map(emojis => emojis.map(chat => {
        if (!chat.reactions || chat.reactions.length === 0) {
          return null;
        }
        const matchingReactions = chat.reactions.filter(reaction => reaction.emoji === emoji);
        if (matchingReactions.length === 0 || chat.message !== messageToFind.message) {
          return null;
        }
        matchingReactions.forEach(reaction => {
          const userReactionIndex = reaction.userReaction.findIndex(reactionItem => reactionItem.sender === selectedUserReaction);
          if (userReactionIndex !== -1) {
            reaction.counter -= 1;
            reaction.userReaction.splice(userReactionIndex, 1);
          }
          else {
            reaction.counter += 1;
            reaction.userReaction.push({
              sender: selectedUserReaction,
              timeStamp: new Date().getTime()
            });
          }
        });
        return chat;
      }).filter(chat => chat !== null))
    );
    this.emojis$.pipe(take(1)).subscribe(filteredReactions => {
      if (filteredReactions.length > 0) {
        this.updateReactionsInFirebase(filteredReactions[0].id, filteredReactions[0].reactions);
      } else {
        this.emojiSelectedReactionChat(emoji, messageToFind)
      }
    });
  }

  async updateReactionsInFirebase(docId, updatedReactions) {
    const document = doc(this.firestore, 'chats', docId);
    await updateDoc(document, { reactions: updatedReactions });
  }

  emojiLikeChannel(emoji, messageToFind, channelId) {
    const selectedUserReaction = this.loggedUser.name;
    this.emojis$ = collectionData(this.channelCollection, { idField: 'id' });
    this.emojis$.pipe(
      take(1),
      mergeMap(emojis => {
        const filteredChannel = emojis.find(channel => channel.id === channelId);
        console.log(filteredChannel);
        if (!filteredChannel) {
          return of(null);
        }
        const filteredMessage = filteredChannel.chats.find(message => message.id === messageToFind.id);
        console.log(filteredMessage);
        if (!filteredMessage || !filteredMessage.reactions || filteredMessage.reactions.length === 0) {
          this.emojiSelectedReactionChannel(emoji, messageToFind, channelId);
          console.log('no reactions');
          return of(null);
        }
        const matchingReactions = filteredMessage.reactions.filter(reaction => reaction.emoji === emoji);
        console.log(matchingReactions);
        if (matchingReactions.length === 0) {
          this.emojiSelectedReactionChannel(emoji, messageToFind, channelId);
          console.log('no matching reactions')
          return of(null);
        }
        matchingReactions.forEach(reaction => {
          console.log(reaction);

          const userReactionIndex = reaction.userReaction.findIndex(reactionItem => reactionItem.sender === selectedUserReaction);
          const reactionIndex = filteredMessage.reactions.findIndex(reactionItem => reactionItem.emoji === emoji);
          console.log(reactionIndex)

          console.log(userReactionIndex);

          if (userReactionIndex !== -1) {
            console.log('-');
            reaction.counter -= 1;
            if (reaction.counter == 0) {
              console.log('all will be deleted', filteredMessage.reactions)
             filteredMessage.reactions.splice(reactionIndex, 1)
            } 
            reaction.userReaction.splice(userReactionIndex, 1);
          } else {
            console.log('+');
            reaction.counter += 1;
            reaction.userReaction.push({
              sender: selectedUserReaction,
              timeStamp: new Date().getTime()
            });
          }
        });
        return of(filteredChannel);
      }),
      filter(chat => chat !== null)
    ).subscribe(filteredReactions => {
      console.log(filteredReactions);
      if (filteredReactions !== null) {
        console.log('reaction>0');
        this.updateChannelReactionsInFirebase(filteredReactions.id, filteredReactions.chats);
      }
    });
  }


  emojiSelectedReactionChannel(emoji, message, channelId) {
    const date = new Date();
    this.reaction.userReaction[0].timeStamp = date.getTime();
    this.reaction.emoji = emoji;
    this.reaction.userReaction[0].sender = this.loggedUser.name;
    console.log(this.reaction);
    this.channelService.postChannelReaction(this.reaction, message, channelId);
  }

  async updateChannelReactionsInFirebase(channelId, updatedChats) {
    console.log(updatedChats);
    console.log(channelId);
    const documentReference = doc(this.firestore, 'channels', channelId);
    try {
      await updateDoc(documentReference, { chats: updatedChats });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  scrollToBottom() {
    const contentFrame = document.getElementById('content-frame');
    if (contentFrame) {
      contentFrame.scrollTop = contentFrame.scrollHeight;
    }
  }

  openThread(chat: any) {
    const data = {
      chat: chat,
      selectedChannel: this.selectedChannel
    }
    if (!this.selectedChannel) {
      data.selectedChannel = this.selectedChannel
    }
    this.contentClicked.emit(JSON.stringify(data));
    document.getElementById('thread')?.classList.remove('d-none');
    event.stopPropagation()
  }

  openDialogchannelInfo() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
    }
    const dialogRef = this.dialog.open(DialogChannelInfoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openShowReaction(i) {
    const emojiContainerChat = document.getElementById(`emojis-container-chat${i}`);
    const emojiContainerChannel = document.getElementById(`emojis-container-channel${i}`);
    if (emojiContainerChat) {
      emojiContainerChat.style.visibility = 'visible';
    }
    if (emojiContainerChannel) {
      emojiContainerChannel.style.visibility = 'visible';
    }
  }

  closeShowReaction(i) {
    const emojiContainerChat = document.getElementById(`emojis-container-chat${i}`);
    const emojiContainerChannel = document.getElementById(`emojis-container-channel${i}`);
    if (emojiContainerChat) {
      emojiContainerChat.style.visibility = 'hidden';
    }
    if (emojiContainerChannel) {
      emojiContainerChannel.style.visibility = 'hidden';
    }
  }

  loadMoreEmojis() {
    const startIndex = this.displayedEmojis.length;
    const endIndex = startIndex + 10;

    if (startIndex < this.emojis.length) {
      const newEmojis = this.emojis.slice(startIndex, endIndex);
      this.displayedEmojis = this.displayedEmojis.concat(newEmojis);
    }
  }
}

