import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  constructor(
    private firebase: FirebaseService,
    private afAuth: Auth
  ){

  }
  ngOnInit(): void {
    this.firebase.setLogoVisible(true);
  }

  ngOnDestroy(): void {
    this.firebase.setLogoVisible(false);
  }



}
