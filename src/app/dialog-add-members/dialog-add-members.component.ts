import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent implements OnInit {

  openDialog: false
  channel: string = localStorage.getItem('channel')
  channelCollection: any = collection(this.firebase, 'channels')
  members$: Observable<any>;
  usersCollection$: any = collection(this.firebase, 'users')
  users$: Observable<any>[];

  constructor(private dialog: MatDialog,
    private firebase: Firestore) { }

  ngOnInit() {
    this.getMembers()
  }

  getMembers() {
    this.usersCollection$ = collectionData(this.usersCollection$, { idField: 'id' });
    this.usersCollection$.subscribe((user) => {
      console.log(user)
    })
  }


  addMember() {

  }

}
