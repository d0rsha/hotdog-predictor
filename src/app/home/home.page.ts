import { Component } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FirestorageServiceService } from '../services/firestorage-service.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { take, map } from 'rxjs/operators';

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


  constructor(
    private imagePicker: ImagePicker,
    private webview: WebView,
    private fsService: FirestorageServiceService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afs: AngularFirestore,
  ) { }

  openImagePicker() {
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
    this.progress = true;
    // Convert to base64
    image = this.webview.convertFileSrc(image);

    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    let token = ''
    for (let i = 0; i < 35; i++) {
      token += letters[Math.floor(Math.random() * letters.length)]
    }

    // uploads img to firebase storage
    this.fsService.uploadImage(image, token)
      .then(async url => {
        this.image = this.fsService.getUrl(token) // 'data:image/jpg;base64,' + image;
        console.log(token)

        this.afs.collection('photos').auditTrail().subscribe(console.log)
        // Make a reference to the future location of the firestore document
        const photoRef = this.afs.collection('photos').doc(token); // , ref => ref.where('id', '==', token));
        this.result$ = photoRef.valueChanges();
        console.log(photoRef)
        /*         this.result$ = this.items.subscribe(arr => {
                  console.log(arr);
                  return arr[0];
                })
        
                // Firestore observable, dismiss loader when data is available
                this.result$ = photoRef.valueChanges().pipe(
                  take(1),
                  map(post => {
                    if (post) {
                      console.log(post)
                      return post
                    } else {
                      console.log(post)
                      return null
                    }
                  })
                ) */

        const toast = await this.toastCtrl.create({
          message: 'Image was updated successfully',
          duration: 3000
        });
        toast.present();
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
