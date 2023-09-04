import { Component, OnDestroy } from '@angular/core';
import { FirebaseService } from './services/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnDestroy {
  hide: boolean = false;
  private logoVisibleSubscription: Subscription;
  title = 'da-bubble';

  constructor(public firebaseService: FirebaseService) {
    this.logoVisibleSubscription = this.firebaseService.logoVisible$.subscribe((visible) => {
      this.hide = visible;
    });
  }

  ngOnDestroy(): void {
    this.logoVisibleSubscription.unsubscribe();
  }
}
