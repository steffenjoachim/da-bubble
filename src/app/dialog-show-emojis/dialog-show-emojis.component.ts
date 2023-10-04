import { Component } from '@angular/core';
import * as emojione from 'emojione';
import { SharedEmojiServiceService } from '../services/shared-emojis/shared-emoji.service.service';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-show-emojis',
  templateUrl: './dialog-show-emojis.component.html',
  styleUrls: ['./dialog-show-emojis.component.scss']
})
export class DialogShowEmojisComponent {
  emojis: string[] = [
    "❤️", "😀", "😍", "👍", "👎", "👌", "🙌", "👏", "😂", "😊",
    "😎", "😜", "😋", "😘", "😆", "🤣", "😇", "😉", "🤗", "🤔",
    "🙄", "😒", "😳", "😌", "😢", "😭", "😩", "😡", "😱", "🤩",
    "🥰", "😅", "🥳", "😤", "😴", "🤯", "😪", "🤕", "🤒", "😮",
    "😬", "😵", "🥴", "🤐", "🤨", "😐", "😑", "😕", "🤓", "🎉",
  ];
  
  constructor(private sharedEmojiServiceService: SharedEmojiServiceService,
    private dialogRef: MatDialogRef<DialogShowEmojisComponent>
    ) {}

  emojiSelected(emoji: string) {
    console.log('Ausgewähltes Emoji:', emoji);
    this.sharedEmojiServiceService.setSelectedEmoji(emoji);
    this.closeDialog();  }

    closeDialog() {
      this.dialogRef.close();
    }

  emojione = emojione;
}
