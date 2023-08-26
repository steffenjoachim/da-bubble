import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  constructor(private firebase: FirebaseService){

  }
  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }

}
