import { Component } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, map, Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-info',
  templateUrl: './dialog-channel-info.component.html',
  styleUrls: ['./dialog-channel-info.component.scss']
})
export class DialogChannelInfoComponent {

  selectedChannel = localStorage.getItem('channel');
  loggedUser: any = localStorage.getItem('userData');
  loggedUserAsJSON = this.loggedUser = JSON.parse(this.loggedUser);
  channelCollection: any = collection(this.firestore, 'channels');
  selectedChannelName: string
  editName: boolean = false;
  showName: boolean = true;
  showDescription: boolean = true;
  editDescription: boolean = false;
  newChannelName: string;
  newDescription: string;
  selectedChannelId: string;
  updatedData = {
    name: '',
    description: ''
  };

  channelAdmin: string;
  channelDescription: string;

  constructor(private firestore: Firestore, private dialogRef: MatDialogRef<DialogChannelInfoComponent>) {
    this.getChannel();
  }

  getChannel() {
    this.channelCollection = collectionData(this.channelCollection, { idField: 'id' });
    this.channelCollection = this.channelCollection.pipe(
      map((channels: any[]) => channels.filter(channel => '# ' + channel.name == this.selectedChannel))
    );
    this.channelCollection.subscribe(channel => {
      this.channelAdmin = channel[0].admin
      this.channelDescription = channel[0].description
      this.selectedChannelId = channel[0].id
      this.selectedChannelName = channel[0].name
    })
  }

  editChannelName() {
    this.showName = false;
    this.editName = true;
  }

  saveChannelName() {
    this.showName = true;
    this.editName = false;
    const name = this.newChannelName;
    const firebaseFieldName = 'name';
    this.updateFirebaseData(name, firebaseFieldName);
  }

  editChannelDescription() {
    this.showDescription = false;
    this.editDescription = true;
  }

  saveChannelDescription() {
    this.showDescription = true;
    this.editDescription = false;
    const description = this.newDescription;
    const firebaseFieldName = 'description';
    this.updateFirebaseData(description, firebaseFieldName);
  }

  async updateFirebaseData(newName, firebaseFieldName) {
    const documentReference = doc(this.firestore, 'channels', this.selectedChannelId);
    const docSnapshot = await getDoc(documentReference);

    if (docSnapshot.exists()) {
      const currentData = docSnapshot.data();

      if (currentData && currentData[firebaseFieldName]) {
        const updatedData = {
          [firebaseFieldName]: newName
        };
        try {
          await updateDoc(documentReference, updatedData);
          console.log('Daten erfolgreich in Firebase aktualisiert:', updatedData);
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Daten in Firebase:', error);
        }
      } else {
        console.error('Die benötigte Eigenschaft ist in den Daten nicht vorhanden.');
      }
    } else {
      console.error('Das Dokument existiert in Firebase nicht.');
    }
  }

  closeDialogChannesInfo() {
    this.dialogRef.close();
  }

  async removeMemberFromFirebase() {
    const documentReference = doc(this.firestore, 'channels', this.selectedChannelId);
    const docSnapshot = await getDoc(documentReference);
    if (docSnapshot.exists()) {
      const currentData = docSnapshot.data();
      if (currentData && currentData['members']) {
        const updatedMembers = currentData['members'].filter(member => member.name !== this.loggedUser.name);
        const updatedData = {
          members: updatedMembers
        };
        try {
          await updateDoc(documentReference, updatedData);
          console.log('Eintrag erfolgreich aus dem Array entfernt:', this.loggedUser.name);
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Daten in Firebase:', error);
        }
      } else {
        console.error('Das benötigte "members"-Array ist in den Daten nicht vorhanden.');
      }
    } else {
      console.error('Das Dokument existiert in Firebase nicht.');
    }
  }
}
