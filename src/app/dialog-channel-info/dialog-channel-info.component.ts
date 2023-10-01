import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-channel-info',
  templateUrl: './dialog-channel-info.component.html',
  styleUrls: ['./dialog-channel-info.component.scss']
})
export class DialogChannelInfoComponent {

  selectedChannel = localStorage.getItem('channel');

}
