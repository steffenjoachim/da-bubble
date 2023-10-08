import { Component } from '@angular/core'
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-reactions',
  templateUrl: './dialog-channel-reactions.component.html',
  styleUrls: ['./dialog-channel-reactions.component.scss']
})
export class DialogChannelReactionsComponent {
  dialogRef: MatDialogRef<any>;


  closeDialogChannelReaction() {
    this.dialogRef.close();
    console.log('closed');
  }

}
