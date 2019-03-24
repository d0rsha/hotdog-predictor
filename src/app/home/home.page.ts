import { Component } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FirestorageServiceService } from '../services/firestorage-service.service';
import { ToastController, LoadingController, Platform } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  result$: any;
  image;
  collection;
  progress = false;
  firebasePlugin = null;


  constructor(
    private imagePicker: ImagePicker,
    private webview: WebView,
    private fsService: FirestorageServiceService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afs: AngularFirestore,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.firebasePlugin = window['FirebasePlugin'];
    })
  }

  ionViewDidEnter() {
    if (this.firebasePlugin == null) {
      console.error('FirebasePlugin not initialized before ionViewDidEnter()')
      this.firebasePlugin.logEvent('select_content',
        {
          content_type: 'page_view',
          item_id: 'FirebasePlugin not initialized before ionViewDidEnter()'
        });

    } else {
      this.firebasePlugin.stopTrace('AppInitialized_to_ionViewDidEnter()')
      // tslint:disable-next-line:no-console
      console.timeEnd('AppInitialized_to_ionViewDidEnter()')
    }
  }


  openImagePicker() {

    // tslint:disable-next-line:no-console
    console.time('trace "select-image"')
    this.firebasePlugin.startTrace('select-image',
      (success: any) => {
        // tslint:disable-next-line:no-console
      },
      (err: any) => console.error('Could not create trace "select-image"'))


    this.imagePicker.hasReadPermission().then(
      (result) => {
        if (result === false) {
          // no callbacks required as this opens a popup which returns async
          this.imagePicker.requestReadPermission();
        } else if (result === true) {
          this.imagePicker.getPictures({
            maximumImagesCount: 1
          }).then(
            (results) => {
              for (let i = 0; i < results.length; i++) {
                this.firebasePlugin.stopTrace('select-image')
                // tslint:disable-next-line:no-console
                console.timeEnd('trace "select-image"')
                this.uploadImageToFirebase(results[i]);
              }
            }, (err) => console.log(err)
          );
        }
      }, (err) => {
        console.log(err);
      });
  }

  async uploadImageToFirebase(image) {
    const loading = await this.loadingCtrl.create({
      message: 'Running prediction...',
      duration: 2000
    });
    loading.present()
    this.progress = true;
    // Convert to base64
    image = this.webview.convertFileSrc(image);

    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    let token = ''
    for (let i = 0; i < 35; i++) {
      token += letters[Math.floor(Math.random() * letters.length)]
    }

    // tslint:disable-next-line:no-console
    console.time('trace "upload-image"')
    this.firebasePlugin.startTrace('upload-image',
      (success: any) => {

      },
      (err: any) => console.error('Could not create trace "test_trace"'))

    // uploads img to firebase storage
    this.fsService.uploadImage(image, token)
      .then(async url => {
        this.image = this.fsService.getUrl(token) // 'data:image/jpg;base64,' + image;

        // this.afs.collection('photos').auditTrail().subscribe(console.log)

        // Make a reference to the future location of the firestore document
        const photoRef = this.afs.collection('photos').doc(token);
        this.result$ = photoRef.valueChanges();

        const toast = await this.toastCtrl.create({
          message: 'Image was updated successfully',
          duration: 3000
        });
        toast.present();
        this.firebasePlugin.stopTrace('upload-image')
        // tslint:disable-next-line:no-console
        console.timeEnd('trace "upload-image"')
      }, async (err) => {
        const toast = await this.toastCtrl.create({
          message: err,
          duration: 3000
        });
        toast.present();
        console.error(err);
      });
  }
}
