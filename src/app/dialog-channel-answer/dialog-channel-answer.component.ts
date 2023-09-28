import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelService } from '../services/channels/channel.service';

@Component({
  selector: 'app-dialog-channel-answer',
  templateUrl: './dialog-channel-answer.component.html',
  styleUrls: ['./dialog-channel-answer.component.scss']
})
export class DialogChannelAnswerComponent {

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogChannelAnswerComponent>,
    public channelService: ChannelService,
    @Inject(MAT_DIALOG_DATA) public chat: any) {
  }

  message: string;

  updateFirebase() {
    console.log(this.chat);
    const userDataString = localStorage.getItem('userData');
    const loggedUser = JSON.parse(userDataString);
    this.channelService.postAnswer(this.chat, loggedUser, this.message)
  }
}
