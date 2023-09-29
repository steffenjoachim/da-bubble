import { Component } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent {

  openDialog: false
  channel: string = localStorage.getItem('channel')
  channelCollection: any = collection(this.firebase, 'channels')
  members$: Observable<any>;

  constructor(private dialog: MatDialog,
    private firebase: Firestore) { }


  getMembers() {

  }

  addMember() {
    this.getMembers()
  }

}
