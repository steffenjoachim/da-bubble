import { Component, Inject, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';

@Component({
  selector: 'app-dialog-select-members',
  templateUrl: './dialog-select-members.component.html',
  styleUrls: ['./dialog-select-members.component.scss']
})
export class DialogSelectMembersComponent {


  openDialog: false;
  channel: string = localStorage.getItem('channel');
  channelCollection$: any = collection(this.firebase, 'channels');
  channels$: Observable<any>;
  members$: Observable<any>;
  usersCollection$: any = collection(this.firebase, 'users')
  users$: Observable<any>[];
  filteredChannel: any[];
  isAlreadyMember: boolean = false;
  selectedChannel = localStorage.getItem('channel');
  userName: string;
  selectedUserNames: string[] = [];
  // channelsData: any = {
  //   admin: '',
  //   members: [],
  //   name: '',
  //   description: '',
  //   chats: []
  // }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private firebase: Firestore,
    private firestore: Firestore,
    private dialogRef: MatDialogRef<DialogAddMembersComponent>,
  ) {
    this.getFilteredChannel()
    console.log(this.data);

  }


  ngOnInit() {
    this.getMembers()
  }

  toggleSelection(event: Event, userName: string) {
    event.stopPropagation();
    const index = this.selectedUserNames.indexOf(userName);
    if (index === -1) {
      this.selectedUserNames.push(userName); 
    } else {
      this.selectedUserNames.splice(index, 1); 
    }
  
    // Füge selectedUserNames zu this.data.members hinzu, aber nur, wenn der Benutzername nicht bereits vorhanden ist
    if (this.data && Array.isArray(this.data.members)) {
      this.selectedUserNames.forEach(name => {
        if (!this.data.members.includes(name)) {
          this.data.members.push(name);
        }
      });
    }
    console.log(this.data);
  }
  

  closeMenu() {
    
  }


  getMembers() {
    console.log(this.data)
    this.usersCollection$ = collectionData(this.usersCollection$, { idField: 'id' });
    this.usersCollection$.subscribe((user) => {
    });
  }

  // async addMember(user) {
  //   this.isAlreadyMember = false;
  //   const documentReference = doc(this.firebase, 'channels', this.filteredChannel[0].id);
  //   try {
  //     const docSnapshot = await getDoc(documentReference);
  //     if (docSnapshot.exists()) {
  //       const currentData = docSnapshot.data();
  //       const currentMembers = currentData['members'];
  //       const userExists = currentMembers.some(member => member.id === user.id);
  //       if (!userExists) {
  //         const updatedMembers = [...currentMembers, user];
  //         await updateDoc(documentReference, { members: updatedMembers });
  //         console.log('Benutzer wurde zum Kanal hinzugefügt.');
  //       } else {
  //         this.isAlreadyMember = true;
  //         this.userName = user.name;
  //         console.log('Der Benutzer ist bereits ein Mitglied des Kanals.', user.name);
  //       }
  //     } else {
  //       console.error('Der Kanal existiert nicht in Firebase:', documentReference);
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim Hinzufügen des Benutzers zum Kanal:', error);
  //   }
  // }

  getFilteredChannel() {
    this.channels$ = collectionData(this.channelCollection$, { idField: 'id' });
    this.channels$.pipe(
      map(channels => {
        this.filteredChannel = channels.filter(c => '# ' + c.name == this.channel);
        return this.filteredChannel;
      })
    ).subscribe(() => {
    });
  }

  closeDialogAddMembers(){
    this.dialogRef.close();
  }

  selectedMembers(){

  }
}
