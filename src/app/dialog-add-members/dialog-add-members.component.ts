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

  openDialog: false
  channel: string = localStorage.getItem('channel')
  channelCollection$: any = collection(this.firebase, 'channels')
  channels$: Observable<any>;
  members$: Observable<any>;
  usersCollection$: any = collection(this.firebase, 'users')
  users$: Observable<any>[];
  filteredChannel: any[];

  constructor(private dialog: MatDialog,
    private firebase: Firestore) {
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

  selectedMembers() {
    console.log('test')
  }

  addMember(user) {
    const documentReference = doc(this.firebase, 'channels', this.filteredChannel[0].id);
    return getDoc(documentReference)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const currentData = docSnapshot.data();
          console.log(currentData)
          const updatedMembers = [...currentData['members'], user];
          return updateDoc(documentReference, { members: updatedMembers });
        } else {
          console.error('no ', documentReference, ' on Firebase')
          return null;
        }
      });
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
}

