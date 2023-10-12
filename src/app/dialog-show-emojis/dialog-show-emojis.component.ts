import { Component, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('emojiTextArea') emojiTextArea: ElementRef; // Verbindung zum Textarea-Element

  constructor(private sharedEmojiServiceService: SharedEmojiServiceService,
    private dialogRef: MatDialogRef<DialogShowEmojisComponent>
  ) { }

  emojiSelected(emoji: string) {
    const textarea = this.emojiTextArea.nativeElement;

    // Füge das ausgewählte Emoji in das <textarea> ein
    textarea.value += emoji;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  emojione = emojione;
}
