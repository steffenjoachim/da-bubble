import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent implements OnInit {

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

  constructor(
    private dialog: MatDialog,
    private firebase: Firestore,
    private firestore: Firestore, 
    private dialogRef: MatDialogRef<DialogAddMembersComponent>
    ) {
    this.getFilteredChannel()
  }

  ngOnInit() {
    this.getMembers()
  }

  getMembers() {
    this.usersCollection$ = collectionData(this.usersCollection$, { idField: 'id' });
    this.usersCollection$.subscribe((user) => {

    });
  }

  async addMember(user) {
    this.isAlreadyMember = false;
    const documentReference = doc(this.firebase, 'channels', this.filteredChannel[0].id);
    try {
      const docSnapshot = await getDoc(documentReference);
      if (docSnapshot.exists()) {
        const currentData = docSnapshot.data();
        const currentMembers = currentData['members'];
        const userExists = currentMembers.some(member => member.id === user.id);
        if (!userExists) {
          const updatedMembers = [...currentMembers, user];
          await updateDoc(documentReference, { members: updatedMembers });
          console.log('Benutzer wurde zum Kanal hinzugefügt.');
        } else {
          this.isAlreadyMember = true;
          console.log('Der Benutzer ist bereits ein Mitglied des Kanals.');
        }
      } else {
        console.error('Der Kanal existiert nicht in Firebase:', documentReference);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Benutzers zum Kanal:', error);
    }
  }

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
}

