import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedEmojiServiceService {
  selectedEmoji: string;

  setSelectedEmoji(emoji: string) {
    this.selectedEmoji = emoji;
  }

  getSelectedEmoji() {
    return this.selectedEmoji;
  }

  constructor() { }
}
