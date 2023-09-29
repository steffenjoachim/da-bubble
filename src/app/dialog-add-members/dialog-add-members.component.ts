import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent {

  openDialog: false



  constructor(private dialog: MatDialog) { }

  addMember() {
    console.log('added');
  }

}
