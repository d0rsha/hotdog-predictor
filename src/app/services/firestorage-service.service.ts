import { Injectable } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';

@Injectable({
  providedIn: 'root'
})
export class FirestorageServiceService {
  urlObservable = {}

  constructor(
    private afs: AngularFireStorage,
  ) { }


  uploadImage(imageURI, token: string) {
    return new Promise<any>((resolve, reject) => {
      const storageRef = this.afs.ref('');


      const imageRef = storageRef.child('').child(token + '.jpg');
      this.encodeImageUri(imageURI, function (image64) {
        imageRef.putString(image64, 'data_url')
          .then(snapshot => {

            resolve(snapshot.downloadURL);
          }, err => {
            reject(err);
          });
      });
    });
  }


  encodeImageUri(imageUri, callback) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const img = new Image();
    img.onload = function () {
      const aux: any = this;
      c.width = aux.width;
      c.height = aux.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = c.toDataURL('image/jpeg');
      callback(dataURL);
    };
    img.src = imageUri;
  }


  getUrl(filename) {
    // Cahche image
    const ref = this.afs.ref(filename + '.jpg')
    if (filename == null) { return; }

    if (filename in this.urlObservable) {
      return this.urlObservable[filename]
    } else {
      console.log('Dopwnload Url');
      this.urlObservable[filename] = ref.getDownloadURL()
      if (this.urlObservable[filename]) {
        return this.urlObservable[filename]
      }
    }
  }

}
