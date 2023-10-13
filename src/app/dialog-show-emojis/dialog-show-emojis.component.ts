import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import * as emojione from 'emojione';
import { SharedEmojiServiceService } from '../services/shared-emojis/shared-emoji.service.service';

@Component({
  selector: 'app-dialog-show-emojis',
  templateUrl: './dialog-show-emojis.component.html',
  styleUrls: ['./dialog-show-emojis.component.scss']
})
export class DialogShowEmojisComponent implements AfterViewInit{
  @Output() openEmojis:EventEmitter<void> = new EventEmitter<void>();
  emojis: string[] = [
    "❤️", "😀", "😍", "👍", "👎", "👌", "🙌", "👏", "😂", "😊",
    "😎", "😜", "😋", "😘", "😆", "🤣", "😇", "😉", "🤗", "🤔",
    "🙄", "😒", "😳", "😌", "😢", "😭", "😩", "😡", "😱", "🤩",
    "🥰", "😅", "🥳", "😤", "😴", "🤯", "😪", "🤕", "🤒", "😮",
    "😬", "😵", "🥴", "🤐", "🤨", "😐", "😑", "😕", "🤓", "🎉",
  ];

  @ViewChild('emojiTextArea') emojiTextArea: ElementRef; // Verbindung zum Textarea-Element

  constructor(private sharedEmojiServiceService: SharedEmojiServiceService,
  ) { }

  ngAfterViewInit() {


  }

  emojiSelected(emoji: string) {
    console.log('selected');
    const textarea = this.emojiTextArea.nativeElement;

    textarea.value += emoji;
  }

  emojione = emojione;
}
