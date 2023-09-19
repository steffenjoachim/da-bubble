import { Component } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-answer',
  templateUrl: './dialog-channel-answer.component.html',
  styleUrls: ['./dialog-channel-answer.component.scss']
})
export class DialogChannelAnswerComponent {

  constructor(public dialog: MatDialog,
    private firestore: Firestore,
    public dialogRef: MatDialogRef<DialogChannelAnswerComponent>) {

  }
  saveAnswer() {

  }
}
