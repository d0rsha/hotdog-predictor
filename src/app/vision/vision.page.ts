import { Component, OnInit } from '@angular/core';

import { tap, filter } from 'rxjs/operators';

import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';

import { Camera, CameraOptions, CameraPopoverOptions } from '@ionic-native/camera/ngx';

import { Observable } from 'rxjs';
import { LoadingController, ActionSheetController } from '@ionic/angular';


@Component({
  selector: 'app-vision',
  templateUrl: './vision.page.html',
  styleUrls: ['./vision.page.scss'],
}) export class VisionPage implements OnInit {
  // Upload task
  task: AngularFireUploadTask;

  // Firestore data
  result$: Observable<any>;

  image: string;

  constructor(
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private camera: Camera,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() { }

  async startUpload(file: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Running AI vision analysis...'
    });
    // Show loader
    loading.present();

    // const timestamp = new Date().getTime().toString();
    const docId = this.afs.createId();

    const path = `${docId}.jpg`;

    // Make a reference to the future location of the firestore document
    const photoRef = this.afs.collection('photos').doc(docId);

    // Firestore observable, dismiss loader when data is available
    this.result$ = photoRef.valueChanges()
      .pipe(
        filter(data => !!data),
        tap(_ => loading.dismiss())
      );


    // The main task
    this.image = 'data:image/jpg;base64,' + file;
    this.task = this.storage.ref(path).putString(this.image, 'data_url');

  }

  // Gets the pic from the native camera then starts the upload
  captureAndUpload() {

    // Show loader
    console.log('Clicked!');
    const options: CameraOptions = {
      quality: 60,
      allowEdit: true,
      targetHeight: 300,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      const base64 = 'data:image/jpeg;base64,' + imageData;
      this.startUpload(base64);
    }, (err) => {
      // Handle error
      console.error(err);
    });

    console.log('Done');
    /*
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      const base64 = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
    });
    */
  }

}
